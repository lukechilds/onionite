(function() {

  // Add ios class to body on iOS devices
  function iosBodyClass() {
    if(
      /iPad|iPhone|iPod/.test(navigator.userAgent)
      && !window.MSStream
      && document.body.classList
    ) {
      document.body.classList.add('ios');
    }
  }

  // Check if DOM has already loaded as we're loading async
  ['interactive', 'complete'].indexOf(document.readyState) >= 0
    ? init()
    : document.addEventListener('DOMContentLoaded', init);

  // When DOM is ready
  function init() {

    // Check for iOS
    iosBodyClass();
  }

})();
