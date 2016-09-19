(function() {

  // Run callback when DOM is ready
  function DOMReady(fn) {

    // Run now if DOM has already loaded as we're loading async
    if(['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      fn();

    // Otherwise wait for DOM
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  // Feature detection results
  var supports = {};

  // Detect localStorage support
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    supports.localStorage = true;
  } catch (e) {
    supports.localStorage = false;
  }

  // Detect inline SVG support
  supports.inlineSVG = (function() {
    var div = document.createElement('div');
    div.innerHTML = '<svg/>';
    return (
      typeof SVGRect != 'undefined'
      && div.firstChild
      && div.firstChild.namespaceURI
    ) == 'http://www.w3.org/2000/svg';
  })();

  // Check required features for favourite nodes
  if(supports.localStorage && supports.inlineSVG) {

    // Get heart SVG
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/heart.svg');
    xhr.addEventListener('load', function(res) {

      // Create heart SVG elem
      var div = document.createElement('div');
      div.innerHTML = xhr.responseText;
      var heartEl = div.firstChild;

      // Add click handler
      heartEl.addEventListener('click', function(e) {
        if(heartEl.classList.contains('hearted')) {
          heartEl.classList.remove('hearted');
        } else {
          heartEl.classList.add('hearted');
        }
      });

      // Inject heart into DOM
      DOMReady(function() {
        var titleEl = document.querySelector('h2.node-title');
        if(titleEl) {
          titleEl.insertBefore(heartEl, titleEl.firstChild);
        }
      });
    });
    xhr.send();
  }

  // Add ios class to body on iOS devices
  DOMReady(function() {
    if(
      /iPad|iPhone|iPod/.test(navigator.userAgent)
      && !window.MSStream
      && document.body.classList
    ) {
      document.body.classList.add('ios');
    }
  });

})();
