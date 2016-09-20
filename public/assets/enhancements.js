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

  // Feature detection
  var supports = {
    localStorage: (function() {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    inlineSVG: (function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (
        typeof SVGRect != 'undefined'
        && div.firstChild
        && div.firstChild.namespaceURI
      ) == 'http://www.w3.org/2000/svg';
    })(),
    querySelector: typeof document.querySelector === 'function',
    classList: 'classList' in document.createElement('div')
  };

  // Check required features for favourite nodes
  if(supports.localStorage && supports.inlineSVG && supports.querySelector && supports.classList) {

    // Get heart SVG
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/heart.svg');
    xhr.addEventListener('load', function() {

      // Create heart SVG elem
      var div = document.createElement('div');
      div.innerHTML = xhr.responseText;
      var heartEl = div.firstChild;

      // Inject heart into DOM
      DOMReady(function() {
        var titleEl = document.querySelector('h2.node-title');
        if(titleEl) {
          titleEl.insertBefore(heartEl, titleEl.firstChild);
        }
      });

      // Show heart as active if we've already hearted this node
      var storageKey = 'heartedNodes';
      var activeClass = 'hearted';
      var heartedNodes = JSON.parse(localStorage.getItem(storageKey)) || [];
      var node = /^\/node\/([a-zA-Z0-9]+)/.exec(window.location.pathname);
      node = node ? node[1] : node;
      if(heartedNodes.indexOf(node) > -1) {
        heartEl.classList.add(activeClass);
      }

      // Add click handler
      heartEl.addEventListener('click', function(e) {

        // Recheck localStorage
        var heartedNodes = JSON.parse(localStorage.getItem(storageKey)) || [];
        var nodeIndex = heartedNodes.indexOf(node);

        // Heart/unheart node
        if(nodeIndex > -1) {
          heartEl.classList.remove(activeClass);
          heartedNodes.splice(nodeIndex, 1);
        } else {
          heartEl.classList.add(activeClass);
          heartedNodes.push(node);
        }

        // Save new heartedNodes
        localStorage.setItem(storageKey, JSON.stringify(heartedNodes));
      });
    });
    xhr.send();
  }

  // Add ios class to body on iOS devices
  if(supports.classList) {
    DOMReady(function() {
      if(
        /iPad|iPhone|iPod/.test(navigator.userAgent)
        && !window.MSStream
        && document.body.classList
      ) {
        document.body.classList.add('ios');
      }
    });
  }

})();
