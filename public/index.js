/* eslint-env browser */
/* eslint-disable no-multi-str */
/* eslint-disable no-mixed-operators */

// eslint-disable-next-line no-promise-executor-return
const wait = time => new Promise(resolve => setTimeout(resolve, time * 1000));

let currentPage;
let currentSearchPage;
let searching = false;
let searchInput;

function element(type) {
	return document.createElement(type);
}

// Run callback when DOM is ready
function domReady(cb) {
	// Run now if DOM has already loaded as we're loading async
	if (['interactive', 'complete'].includes(document.readyState)) {
		cb();

		// Otherwise wait for DOM
	} else {
		document.addEventListener('DOMContentLoaded', cb);
	}
}

const find = document.querySelector.bind(document);

function humanTimeAgo(utcDate) {
	const dateNow = Date.now();
	const oldDate = new Date(utcDate);
	const diff = dateNow - oldDate.getTime();
	const uptime = {};

	uptime.s = Math.round(diff / 1000);
	uptime.m = Math.floor(uptime.s / 60);
	uptime.h = Math.floor(uptime.m / 60);
	uptime.d = Math.floor(uptime.h / 24);

	uptime.s %= 60;
	uptime.m %= 60;
	uptime.h %= 24;

	let readableUptime = '';
	readableUptime += uptime.d ? ` ${uptime.d}d` : '';
	readableUptime += uptime.h ? ` ${uptime.h}h` : '';
	if ((!uptime.d || !uptime.h) && uptime.m) {
		readableUptime += ` ${uptime.m}m`;
	}

	return readableUptime.trim();
}

function prettyBytes(number) {
	const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	if (number < 1) {
		return number + ' B';
	}

	const exponent = Math.min(Math.floor(Math.log(number) / Math.log(1024)), units.length - 1);
	number = Number((number / 1024 ** exponent).toFixed(2));
	const unit = units[exponent];

	return `${number} ${unit}`;
}

function getNodes(code) {
	fetch('https://onionite-test.vercel.app/api/listing/' + code)
		.then(response => response.json())
		.then(data => addNodes(data))
		.catch(error => {
			showOfflineMessage();
			console.log(error);
		});
}

function addNodes(nodeList) {
	let i = 1; // I is the number the user sees, and the first node should be displayed as 1, not as 0
	document.querySelector('#nodeList').innerHTML = '';
	if (nodeList.length < 10) {
		document.querySelector('#next').style.display = 'none';
	} else {
		document.querySelector('#next').style.display = '';
	}

	nodeList.forEach(node => {
		if (searching) {
			node.number = (currentSearchPage - 1) * 10 + i;
		} else {
			node.number = (currentPage - 1) * 10 + i;
		}

		const nodeInfo = generateNodeInfo(node);
		document.querySelector('#nodeList').append(nodeInfo);
		if (i === 10) {
			return;
		}

		i++;
	});
}

function generateNodeInfo(node) {
	const infoRow = element('tr');
	const nodeNumber = element('td');
	nodeNumber.innerHTML = node.number;
	const nodeNickname = element('td');
	const nodeNicknameButton = element('button');
	nodeNicknameButton.classList.add('fakelink');
	nodeNicknameButton.innerHTML = node.nickname;
	nodeNicknameButton.addEventListener('click', () => {
		showNode(node, currentPage);
	});

	nodeNickname.append(nodeNicknameButton);
	const nodeBandwidth = element('td');
	nodeBandwidth.innerHTML = prettyBytes(node.advertised_bandwidth);
	const nodeUptime = element('td');
	nodeUptime.innerHTML = humanTimeAgo(node.last_restarted);
	const nodeCountry = element('td');
	nodeCountry.innerHTML = node.country_name;
	const nodeFlags = element('td');
	if (node.flags.length > 0) {
		node.flags.forEach(flag => {
			const flagInfo = element('i');
			flagInfo.classList.add('icon-' + flag.toLowerCase());
			flagInfo.title = flag;
			flagInfo.innerHTML = '<span class="hidden">' + flag + '</span>';
			nodeFlags.append(flagInfo);
		});
	}

	const nodeType = element('td');
	nodeType.innerHTML = node.type;
	infoRow.append(nodeNumber);
	infoRow.append(nodeNickname);
	infoRow.append(nodeBandwidth);
	infoRow.append(nodeUptime);
	infoRow.append(nodeCountry);
	infoRow.append(nodeFlags);
	infoRow.append(nodeType);
	return infoRow;
}

function getVersion() {
	fetch('https://onionite-test.vercel.app/api/version/version')
		.then(response => response.text())
		.then(data => setVersion(data));
}

function setVersion(version) {
	document.querySelector('#version').innerHTML = 'v' + version;
}

// eslint-disable-next-line no-unused-vars
function lastPage() {
	if (searching) {
		if (currentSearchPage > 1) {
			currentSearchPage--;
			getNodes('p' + currentSearchPage + ':s' + searchInput);
			if (currentSearchPage === 1) {
				document.querySelector('#prev').style.display = 'none';
			}
		}
	} else if (currentPage > 1) {
		currentPage--;
		getNodes('p' + currentPage);
		if (currentPage === 1) {
			document.querySelector('#prev').style.display = 'none';
		}
	}
}

// eslint-disable-next-line no-unused-vars
function nextPage() {
	if (searching) {
		currentSearchPage++;
		getNodes('p' + currentSearchPage + ':s' + searchInput);
		document.querySelector('#prev').style.display = '';
	} else {
		currentPage++;
		getNodes('p' + currentPage);
		document.querySelector('#prev').style.display = '';
	}
}

document.addEventListener('DOMContentLoaded', () => {
	handleConnection();
	getVersion();
	getNodes('p1'); // API page counter starts at 1
	currentPage = 1;
}, false);

// eslint-disable-next-line no-unused-vars
function searchInputChanged(input) {
	document.querySelector('#main').innerHTML = ' \
	<div id="offlinemsg" style="position: absolute;  font-size: 1.5rem; width: 100%; left: 0px;background: red none repeat scroll 0% 0%;top: -10rem;z-index: 999;text-align: center;padding: 1.75rem 0;overflow: hidden;max-height: 5rem;transition: all ease 2s;"> \
	  Error: You are offline, but the next page is not cached and can therefore not be displayed. \
	</div> \
	<div class="offline" id="offline" style="margin-bottom: 2rem;"> \
	  <h2>No connection</h2> \
	  <div class="content" id="offlinecontent"> \
		<p>There seems to be an issue connecting to the server.</p> \
	  </div> \
	</div><table><thead><tr><th>#</th><th>Nickname</th><th>Bandwidth</th><th>Uptime</th><th>Country</th><th>Flags</th><th>Type</th></tr></thead><tbody id="nodeList"></tbody></table> \
	<div class="pagination clearfix"> \
	<button class="prev" id="prev" onclick="lastPage();" style="display:none;background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Prev</span>‹</button> \
	<button class="next" id="next" onclick="nextPage();" style="background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Next</span>›</button> \
	</div>';
	if (input === '') {
		searching = false;
		getNodes('p' + currentPage);
		if (currentPage === 1) {
			document.querySelector('#prev').style.display = 'none';
		} else {
			document.querySelector('#prev').style.display = '';
		}
	} else {
		searching = true;
		currentSearchPage = 1;
		searchInput = input;
		getNodes('p' + currentPage + ':s' + input);
		document.querySelector('#prev').style.display = 'none';
	}
}

window.addEventListener('online', handleConnection);
window.addEventListener('offline', handleConnection);

function isReachable(url) {
	return fetch(url, { method: 'HEAD', mode: 'no-cors' })
		.then(response => {
			return response && (response.ok || response.type === 'opaque');
		})
		.catch(error => {
			console.log(error);
		});
}

function handleConnection() {
	if (navigator.onLine) {
		isReachable('https://onionite-test.vercel.app/api/listing/p0').then(online => { // This URL is never cached
			if (online) {
				document.querySelector('#offline').style.display = 'none';
			} else {
				document.querySelector('#offline').style.display = '';
				const currentContent = document.querySelector('#offlinecontent').innerHTML;
				document.querySelector('#offlinecontent').innerHTML = currentContent + 'This data is cached from ' + window.cacheDate;
			}
		});
	} else {
		document.querySelector('#offline').style.display = '';
	}
}

function showOfflineMessage() {
	currentPage--;
	document.querySelector('#offlinemsg').style.top = '0';
	wait(2).then(() => {
		document.querySelector('#offlinemsg').style.top = '-6rem';
	});
}

// Information about a specific node

// Favourite nodes
const favouriteNodes = {

	// Key used in localStorage
	storageKey: 'heartedNodes',

	// Url to heart SVG
	heartPath: '/assets/heart.svg',

	// Class added to heart SVG element when active
	activeClass: 'hearted',

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
		return typeof favouriteNodes.getHeartedNodes()[node.fingerprint] !== 'undefined';
	},

	// Heart node
	heart(node) {
		const heartedNodes = favouriteNodes.getHeartedNodes();
		heartedNodes[node.fingerprint] = node;
		favouriteNodes.saveHeartedNodes(heartedNodes);
		favouriteNodes.updateHeartedNodesList();
		return heartedNodes;
	},

	// Unheart node
	unHeart(node) {
		const heartedNodes = favouriteNodes.getHeartedNodes();
		delete heartedNodes[node.fingerprint];
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

		menu.innerHTML = '';
		const heartedNodes = favouriteNodes.getHeartedNodes();
		const nodeHashes = Object.keys(heartedNodes);
		if (nodeHashes.length > 0) {
			const ul = element('ul');
			nodeHashes.forEach(node3 => {
				const li = element('li');
				const button = element('button');
				button.classList.add('fakelink');
				button.id = node3;
				button.innerHTML = heartedNodes[node3].nickname;
				li.append(button);
				ul.append(li);
				button.addEventListener('click', () => {
					try {
						fetch('https://onionite-test.vercel.app/api/node/' + node3)
							.then(response => response.json())
							.then(data => {
								data.node.bandwidth = data.bandwidth;
								showNode(data.node, 1);
							});
					} catch {
						showNode(heartedNodes[node3], 1);
					}
				});
			});
			menu.append(ul);
		} else {
			menu.innerHTML += '<div class="empty">Click the heart next to a node\'s title on it\'s own page to save it here for easy access :)</div>';
		}

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
	init(node2) {
		const nodeTemporary = node2;
		if (nodeTemporary) {
			// Start loading heart SVG before DOM
			favouriteNodes.loadSVG(svg => {
				// Create heart SVG elem
				const div = element('div');
				div.innerHTML = svg;
				const heartElement = div.firstChild;

				// Show heart as active if we've already hearted this node
				if (favouriteNodes.isHearted(node)) {
					heartElement.classList.add(favouriteNodes.activeClass);
				}

				// Add click handler
				heartElement.addEventListener('click', () => {
					// Heart/unheart node
					const node = node2;
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
					// Heart
					const titleElement = find('h2.node-title');
					if (titleElement) {
						titleElement.insertBefore(heartElement, titleElement.firstChild);
					}
				});
			});

			// If current node is hearted
			const node = node2;
			if (favouriteNodes.isHearted(node)) {
				// Heart it again so we get the new name if it's updated
				favouriteNodes.heart(node);
			}
		}
	},
	createMenu() {
		favouriteNodes.loadSVG(svg => {
			domReady(() => {
				const headerHeight = find('.title').offsetHeight;
				const headerBoxShadow = 3;

				// Menu button
				const menuButton = element('div');
				menuButton.classList.add('menu-button');
				menuButton.style.height = headerHeight + 'px';
				menuButton.innerHTML = svg;
				menuButton.addEventListener('click', () => {
					favouriteNodes.updateHeartedNodesList();
					find('.menu').classList.toggle('active');
				});
				find('header .wrapper').append(menuButton);

				// Menu
				const menu = element('div');
				menu.classList.add('menu');
				menu.style.top = (headerHeight + headerBoxShadow) + 'px';
				menu.style.height = 'calc(100% - ' + (headerHeight + headerBoxShadow) + 'px)';
				document.body.append(menu);
				favouriteNodes.updateHeartedNodesList();
			});
		});
	}
};

function createHeader(node, page) {
	const clearfix = element('div');
	const nameContainer = element('h2');
	const name = element('span');
	const status = element('section');
	const goBackArea = element('section');
	const goBackButton = element('button');
	clearfix.classList.add('clearfix');
	goBackArea.classList.add('status');
	status.classList.add('status');
	nameContainer.classList.add('node-title');
	name.classList.add('name');
	status.innerHTML = '<h3>Status:</h3>' + humanTimeAgo(node.last_restarted);
	name.innerHTML = node.nickname;
	nameContainer.innerHTML = node.type + ': ';
	nameContainer.append(name);
	goBackButton.classList.add('fakelink');
	goBackButton.innerHTML = 'Go back   ';
	goBackButton.addEventListener('click', () => {
		document.querySelector('#main').innerHTML = ' \
		<div id="offlinemsg" style="position: absolute;  font-size: 1.5rem; width: 100%; left: 0px;background: red none repeat scroll 0% 0%;top: -10rem;z-index: 999;text-align: center;padding: 1.75rem 0;overflow: hidden;max-height: 5rem;transition: all ease 2s;"> \
		  Error: You are offline, but the next page is not cached and can therefore not be displayed. \
		</div> \
		<div class="offline" id="offline" style="margin-bottom: 2rem;"> \
		  <h2>No connection</h2> \
		  <div class="content" id="offlinecontent"> \
			<p>There seems to be an issue connecting to the server.</p> \
		  </div> \
		</div><table><thead><tr><th>#</th><th>Nickname</th><th>Bandwidth</th><th>Uptime</th><th>Country</th><th>Flags</th><th>Type</th></tr></thead><tbody id="nodeList"></tbody></table> \
		<div class="pagination clearfix"> \
		<button class="prev" id="prev" onclick="lastPage();" style="display:none;background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Prev</span>‹</button> \
		<button class="next" id="next" onclick="nextPage();" style="background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Next</span>›</button> \
		</div>';
		if (navigator.onLine) {
			isReachable('https://onionite-test.vercel.app/api/listing/p0').then(online => { // This URL is never cached
				if (online) {
					document.querySelector('#offline').style.display = 'none';
				} else {
					document.querySelector('#offline').style.display = '';
					const currentContent = document.querySelector('#offlinecontent').innerHTML;
					document.querySelector('#offlinecontent').innerHTML = currentContent + 'This data is cached from ' + window.cacheDate;
				}
			});
		} else {
			document.querySelector('#offline').style.display = '';
		}

		if (page < 2) {
			document.querySelector('#prev').style.display = 'none';
		} else {
			document.querySelector('#prev').style.display = '';
		}

		console.log(page);
		getNodes('p' + page);
	});

	goBackArea.append(goBackButton);
	clearfix.append(nameContainer);
	clearfix.append(goBackArea);
	clearfix.append(status);
	return clearfix;
}

function createOverview(node) {
	const overview = element('section');
	overview.classList.add('overview');
	overview.innerHTML = '<h3>Overview</h3><i class="icon-tor"></i>';
	const dl = element('dl');
	if (node.nickname) {
		dl.innerHTML += '<dt>Nickname</dt><dd>' + node.nickname + '</dd>';
	}

	if (node.fingerprint) {
		dl.innerHTML += '<dt>Fingerprint</dt><dd>' + node.fingerprint + '</dd>';
	}

	if (node.hashed_fingerprint) {
		dl.innerHTML += '<dt>Hashed Fingerprint</dt><dd>' + node.hashed_fingerprint + '</dd>';
	}

	if (node.advertised_bandwidth) {
		dl.innerHTML += '<dt>Advertised Bandwidth</dt><dd>' + node.advertised_bandwidth + '</dd>';
	}

	if (node.flags && node.flags.length > 0) {
		dl.innerHTML += '<dt>Flags</dt>';
		node.flags.forEach(flag => {
			dl.innerHTML += '<dd class="flag"><i class="icon-' + flag.toLowerCase() + '"></i> ' + flag + '</dd>';
		});
	}

	overview.append(dl);
	return overview;
}

function createBandwidth(node) {
	if (node.bandwidth) {
		const bandwidth = element('section');
		bandwidth.classList.add('bandwidth');
		bandwidth.setAttribute('aria-hidden', 'true');
		bandwidth.innerHTML = '<h3>Bandwidth <small>(MB/s over the last month)</small></h3>';
		const bandwidth2 = element('pre');
		bandwidth2.innerHTML = node.bandwidth;
		bandwidth.append(bandwidth2);
		return bandwidth;
	}

	return element('section');
}

function createColumns(node) {
	const columns = element('div');
	columns.classList.add('columns');
	const configInfo = element('section');
	configInfo.innerHTML = '<h3>Config</h3>';
	const dl = element('dl');
	if (node.type) {
		dl.innerHTML += '<dt>Type</dt><dd>' + node.type + '</dd>';
	}

	if (node.platform) {
		dl.innerHTML += '<dt>Platform</dt><dd>' + node.platform + '</dd>';
	}

	if (node.or_addresses.length > 0) {
		dl.innerHTML += '<dt>Or Addresses</dt>';
		node.or_addresses.forEach(address => {
			dl.innerHTML += '<dd>' + address + '</dd>';
		});
	}

	if (node.dir_address) {
		dl.innerHTML += '<dt>Dir Address</dt><dd>' + node.dir_address + '</dd>';
	}

	if (node.transports) {
		dl.innerHTML += '<dt>Transport Protocols</dt>';
		node.transports.forEach(transport => {
			dl.innerHTML += '<dd>' + transport + '</dd>';
		});
	}

	if (node.exit_policy && node.exit_policy.length > 0) {
		dl.innerHTML += '<dt>Exit Policy</dt>';
		node.exit_policy.forEach(rule => {
			dl.innerHTML += '<dd>' + rule + '</dd>';
		});
	}

	configInfo.append(dl);
	columns.append(configInfo);
	const metaInfo = element('section');
	metaInfo.innerHTML = '<h3>Meta</h3>';
	const dl2 = element('dl');
	if (node.host_name) {
		dl2.innerHTML += '<dt>Hostname</dt><dd>' + node.host_name + '</dd>';
	}

	if (node.contact) {
		dl2.innerHTML += '<dt>Contact</dt><dd>' + node.contact + '</dd>';
	}

	if (node.country_name) {
		dl2.innerHTML += '<dt>Country</dt><dd>' + node.country_name + '</dd>';
	}

	if (node.region_name) {
		dl2.innerHTML += '<dt>Region</dt><dd>' + node.region_name + '</dd>';
	}

	if (node.city_name) {
		dl2.innerHTML += '<dt>City</dt><dd>' + node.city_name + '</dd>';
	}

	if (node.as_number) {
		dl2.innerHTML += '<dt>AS number</dt><dd>' + node.as_number + '</dd>';
	}

	if (node.as_name) {
		dl2.innerHTML += '<dt>AS name</dt><dd>' + node.as_name + '</dd>';
	}

	if (node.consensus_weight) {
		dl2.innerHTML += '<dt>Consensus Weight</dt><dd>' + node.consensus_weight + '</dd>';
	}

	if (node.effective_family) {
		dl2.innerHTML += '<dt>Family</dt>';
		node.effective_family.forEach(familyMember => {
			try {
				fetch('https://onionite-test.vercel.app/api/node/' + familyMember)
					.then(response => response.json())
					.then(data => {
						const familyButton = element('button');
						familyButton.classList.add('fakelink');
						familyButton.innerHTML = data.node.fingerprint;
						familyButton.addEventListener('click', () => {
							data.node.bandwidth = data.bandwidth;
							showNode(data.node, 1);
						});

						dl2.append(familyButton);
					});
			} catch {
				// Offline
			}
		});
	}

	metaInfo.append(dl2);
	columns.append(metaInfo);
	return columns;
}

function showNode(node, page) {
	const main = document.querySelector('#main');
	main.innerHTML = ' \
	<div id="offlinemsg" style="position: absolute;  font-size: 1.5rem; width: 100%; left: 0px;background: red none repeat scroll 0% 0%;top: -10rem;z-index: 999;text-align: center;padding: 1.75rem 0;overflow: hidden;max-height: 5rem;transition: all ease 2s;"> \
	  Error: You are offline, but the next page is not cached and can therefore not be displayed. \
	</div> \
	<div class="offline" id="offline" style="margin-bottom: 2rem;"> \
	  <h2>No connection</h2> \
	  <div class="content" id="offlinecontent"> \
		<p>There seems to be an issue connecting to the server.</p> \
	  </div> \
	</div>';
	if (navigator.onLine) {
		isReachable('https://onionite-test.vercel.app/api/listing/p0').then(online => { // This URL is never cached
			if (online) {
				document.querySelector('#offline').style.display = 'none';
			} else {
				document.querySelector('#offline').style.display = '';
				const currentContent = document.querySelector('#offlinecontent').innerHTML;
				document.querySelector('#offlinecontent').innerHTML = currentContent + 'This data is cached from ' + window.cacheDate;
			}
		});
	} else {
		document.querySelector('#offline').style.display = '';
	}

	main.append(createHeader(node, page));
	main.append(createOverview(node));
	main.append(createBandwidth(node));
	main.append(createColumns(node));
	favouriteNodes.init(node);
}

favouriteNodes.createMenu();
