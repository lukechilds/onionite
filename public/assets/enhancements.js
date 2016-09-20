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

  // Feature tester
  function FeatureTester(tests) {
    var self = this;

    self.tests = tests;

    self.test = function(features) {
      if(!features || !features.length) {
        return false;
      }
      return features.every(function(feature) {
        return self.tests[feature];
      });
    }
  }

  // Init once, don't re-detect features each time
  var supports = new FeatureTester({
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
  });

  // Favourite nodes
  var favouriteNodes = {

    // Key used in localStorage
    storageKey: 'heartedNodes',

    // Url to heart SVG
    heartPath: '/assets/heart.svg',

    // Class added to heart SVG element when active
    activeClass: 'hearted',

    // Gets current node hash
    getCurrentNode: function() {
      var node = /^\/node\/([a-zA-Z0-9]+)/.exec(window.location.pathname);
      return node ? node[1] : node;
    },

    // Gets hearted nodes
    getHeartedNodes: function() {
      return JSON.parse(localStorage.getItem(favouriteNodes.storageKey)) || [];
    },

    // Saves hearted nodes
    saveHeartedNodes: function(heartedNodes) {
      return localStorage.setItem(favouriteNodes.storageKey, JSON.stringify(heartedNodes));
    },

    // Checks if node is hearted
    isHearted: function(node) {
      return favouriteNodes.getHeartedNodes().indexOf(node) > -1;
    },

    // Heart node
    heart: function(node) {
      var heartedNodes = favouriteNodes.getHeartedNodes();
      heartedNodes.push(node);
      return favouriteNodes.saveHeartedNodes(heartedNodes);
    },

    // Unheart node
    unHeart: function(node) {
      var heartedNodes = favouriteNodes.getHeartedNodes();
      var nodeIndex = heartedNodes.indexOf(node);
      heartedNodes.splice(nodeIndex, 1);
      return favouriteNodes.saveHeartedNodes(heartedNodes);
    },

    // Load SVG, run callback when loaded
    loadSVG: function(cb) {

      // Get heart SVG
      var xhr = new XMLHttpRequest();
      xhr.open('GET', favouriteNodes.heartPath);
      xhr.addEventListener('load', function() {

        // Create heart SVG elem
        var div = document.createElement('div');
        div.innerHTML = xhr.responseText;
        var heartEl = div.firstChild;

        // Show heart as active if we've already hearted this node
        var node = favouriteNodes.getCurrentNode();
        if(favouriteNodes.isHearted(node)) {
          heartEl.classList.add(favouriteNodes.activeClass);
        }

        // Add click handler
        heartEl.addEventListener('click', function() {

          // Heart/unheart node
          var node = favouriteNodes.getCurrentNode();
          if(favouriteNodes.isHearted(node)) {
            heartEl.classList.remove(favouriteNodes.activeClass);
            favouriteNodes.unHeart(node);
          } else {
            heartEl.classList.add(favouriteNodes.activeClass);
            favouriteNodes.heart(node);
          }
        });

        // Run callback
        cb(heartEl);
      });
      xhr.send();
    },

    // Initiate node favouriting
    init: function() {

      // Start loading heart SVG before DOM
      favouriteNodes.loadSVG(function(heartEl) {

        // Then inject into DOM when it's ready
        DOMReady(function() {
          var titleEl = document.querySelector('h2.node-title');
          if(titleEl) {
            titleEl.insertBefore(heartEl, titleEl.firstChild);
          }
        });
      });

      // Inject menu button into DOM
      DOMReady(function() {
        var menuButton = document.createElement('div');
        menuButton.classList.add('menu');
        menuButton.innerHTML = '&#9776;';
        menuButton.style.height = document.querySelector('.title').offsetHeight + 'px';
        document.querySelector('header .wrapper').appendChild(menuButton);
      });
    }
  };

  // Init favourite nodes
  if(supports.test(['localStorage', 'inlineSVG', 'querySelector', 'classList'])) {
    favouriteNodes.init();
  }

  // Add ios class to body on iOS devices
  if(supports.test(['classList'])) {
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
