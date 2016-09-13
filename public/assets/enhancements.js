// Check if DOM has already loaded as we're loading async
['interactive', 'complete'].indexOf(document.readyState) >= 0
  ? init()
  : document.addEventListener('DOMContentLoaded', init);

// When DOM is ready
function init() {
}
