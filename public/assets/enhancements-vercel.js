/* eslint-env browser */
(function () {
	// Space optimisations
	const doc = document;
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

	// Service worker
	if (supports.test(['serviceWorker'])) {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw-vercel.js')
				.catch(error => {
					console.log('Registration failed with ' + error);
				});
		}
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
