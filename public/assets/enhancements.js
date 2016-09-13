// Check if DOM has already loaded as we're loading async
if(['interactive', 'complete'].indexOf(document.readyState) >= 0) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

// When DOM is ready
function init() {
}
