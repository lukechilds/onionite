/* eslint-env browser */
(function () {
	// Space optimisations
	const doc = document;
	const find = doc.querySelector.bind(doc);
	const create = doc.createElement.bind(doc);

	// Run callback when DOM is ready
	function domReady(cb) {
		// Run now if DOM has already loaded as we're loading async
		if (['interactive', 'complete'].includes(doc.readyState)) {
			cb();

		// Otherwise wait for DOM
		} else {
			doc.addEventListener('DOMContentLoaded', cb);
		}
	}

	// Feature detection
	const supports = {
		test(features) {
			const self = this;
			if (!features || features.length === 0) {
				return false;
			}

			return features.every(feature => {
				return self.tests[feature];
			});
		},
		tests: {
			localStorage: (function () {
				try {
					localStorage.setItem('test', 'test');
					localStorage.removeItem('test');
					return true;
				} catch {
					return false;
				}
			})(),
			inlineSVG: (function () {
				const div = create('div');
				div.innerHTML = '<svg/>';
				return (
					typeof SVGRect !== 'undefined' &&
					div.firstChild &&
					div.firstChild.namespaceURI
				) === 'http://www.w3.org/2000/svg';
			})(),
			querySelector: typeof doc.querySelector === 'function',
			classList: (function () {
				const div = create('div');
				div.innerHTML = '<svg/>';
				return 'classList' in div.firstChild;
			})(),
			serviceWorker: 'serviceWorker' in navigator
		}
	};

	// Favourite nodes
	const favouriteNodes = {

		// Key used in localStorage
		storageKey: 'heartedNodes',

		// Url to heart SVG
		heartPath: '/assets/heart.svg',

		// Class added to heart SVG element when active
		activeClass: 'hearted',

		// Gets current node hash
		getCurrentNode() {
			const node = /^\/node\/([a-zA-Z\d]+)/.exec(window.location.pathname);
			return node ? node[1] : node;
		},

		// Gets current node title
		getCurrentNodeTitle() {
			return find('h2.node-title .name').textContent;
		},

		// Gets hearted nodes
		getHeartedNodes() {
			return JSON.parse(localStorage.getItem(favouriteNodes.storageKey)) || {};
		},

		// Saves hearted nodes
		saveHeartedNodes(heartedNodes) {
			return localStorage.setItem(favouriteNodes.storageKey, JSON.stringify(heartedNodes));
		},

		// Checks if node is hearted
		isHearted(node) {
			return typeof favouriteNodes.getHeartedNodes()[node] !== 'undefined';
		},

		// Heart node
		heart(node) {
			const heartedNodes = favouriteNodes.getHeartedNodes();
			heartedNodes[node] = favouriteNodes.getCurrentNodeTitle();
			favouriteNodes.saveHeartedNodes(heartedNodes);
			favouriteNodes.updateHeartedNodesList();
			return heartedNodes;
		},

		// Unheart node
		unHeart(node) {
			const heartedNodes = favouriteNodes.getHeartedNodes();
			delete heartedNodes[node];
			favouriteNodes.saveHeartedNodes(heartedNodes);
			favouriteNodes.updateHeartedNodesList();
			return heartedNodes;
		},

		// Get list of hearted nodes
		updateHeartedNodesList() {
			const menu = find('.menu');
			if (!menu) {
				return false;
			}

			let menuHTML = '';
			const heartedNodes = favouriteNodes.getHeartedNodes();
			const nodeHashes = Object.keys(heartedNodes);
			if (nodeHashes.length > 0) {
				menuHTML += '<ul>';
				nodeHashes.forEach(node => {
					menuHTML += '<li><a href="/node/' + node + '">' + heartedNodes[node] + '</a></li>';
				});
				menuHTML += '</ul>';
			} else {
				menuHTML += '<div class="empty">Click the heart next to a node\'s title on it\'s own page to save it here for easy access :)</div>';
			}

			menu.innerHTML = menuHTML;
			return menu.innerHTML;
		},

		// Load SVG, run callback when loaded
		loadSVG(cb) {
			// Get heart SVG
			const xhr = new XMLHttpRequest();
			xhr.open('GET', favouriteNodes.heartPath);
			xhr.addEventListener('load', () => {
				cb(xhr.responseText);
			});
			xhr.send();
		},

		// Initiate node favouriting
		init() {
			// Start loading heart SVG before DOM
			favouriteNodes.loadSVG(svg => {
				// Create heart SVG elem
				const div = create('div');
				div.innerHTML = svg;
				const heartElement = div.firstChild;

				// Show heart as active if we've already hearted this node
				const node = favouriteNodes.getCurrentNode();
				if (favouriteNodes.isHearted(node)) {
					heartElement.classList.add(favouriteNodes.activeClass);
				}

				// Add click handler
				heartElement.addEventListener('click', () => {
					// Heart/unheart node
					const node = favouriteNodes.getCurrentNode();
					if (favouriteNodes.isHearted(node)) {
						heartElement.classList.remove(favouriteNodes.activeClass);
						favouriteNodes.unHeart(node);
					} else {
						heartElement.classList.add(favouriteNodes.activeClass);
						favouriteNodes.heart(node);
					}
				});

				// Then inject into DOM when it's ready
				domReady(() => {
					const headerHeight = find('.title').offsetHeight;
					const headerBoxShadow = 3;

					// Heart
					const titleElement = find('h2.node-title');
					if (titleElement) {
						titleElement.insertBefore(heartElement, titleElement.firstChild);
					}

					// Menu button
					const menuButton = create('div');
					menuButton.classList.add('menu-button');
					menuButton.style.height = headerHeight + 'px';
					menuButton.innerHTML = svg;
					menuButton.addEventListener('click', () => {
						favouriteNodes.updateHeartedNodesList();
						find('.menu').classList.toggle('active');
					});
					find('header .wrapper').append(menuButton);

					// Menu
					const menu = create('div');
					menu.classList.add('menu');
					menu.style.top = (headerHeight + headerBoxShadow) + 'px';
					menu.style.height = 'calc(100% - ' + (headerHeight + headerBoxShadow) + 'px)';
					document.body.append(menu);
					favouriteNodes.updateHeartedNodesList();
				});
			});

			// If current node is hearted
			const node = favouriteNodes.getCurrentNode();
			if (favouriteNodes.isHearted(node)) {
				// Heart it again so we get the new name if it's updated
				favouriteNodes.heart(node);
			}
		}
	};

	// Service worker
	if (supports.test(['serviceWorker', 'querySelector', 'classList'])) {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js')
				.catch(error => {
					console.log('Registration failed with ' + error);
				});
		}

		// Show cache message on stale pages
		domReady(() => {
			if (window.cacheDate) {
				const offlineMessage = create('div');
				offlineMessage.classList.add('cache-message');
				offlineMessage.textContent = '*There seems to be an issue connecting to the server. This data is cached from ' + window.cacheDate;
				const main = find('main');
				if (main) {
					doc.body.classList.add('no-connection');
					main.insertBefore(offlineMessage, main.firstChild);
				}
			}
		});
	}

	// Init favourite nodes
	if (supports.test(['localStorage', 'inlineSVG', 'querySelector', 'classList'])) {
		favouriteNodes.init();
	}

	// Add ios class to body on iOS devices
	if (supports.test(['classList'])) {
		domReady(() => {
			if (
				/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!window.MSStream
			) {
				doc.body.classList.add('ios');
			}
		});
	}
})();
