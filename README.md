# Tor Explorer

> Explore the Tor network in under 10k

An entry for the [10k Apart](https://a-k-apart.com/) contest. Tor Explorer allows you to view information on the individual nodes that make up the Tor network. It is essentially a rewrite of the existing [Atlas](https://atlas.torproject.org/) web app with some additional features such as pagination, the ability to save nodes to your favourites, increased performance, better accessibility/mobile support, offline functionality and not requiring JavaScript.

## Size

An average Tor Explorer page weighs in at just over 7k. If the browser has JavaScript enabled additional requests will be made for ~1.5k of JavaScript enhancements and a ~500 byte SVG. These are requested asynchronously and so do not block the page load. They are purely for progressive enhancements and the site is fully usable without JavaScript.

Including the asynchronously loaded enhancements the page is still under 10k (~9.5k). The equivalent Atlas pages tend to be around 480k.

I have kept the size down by not using any 3rd party libraries. Everything has been implemented in vanilla HTML, CSS and JavaScript. I've also done as much heavy lifting on the server as possible to keep the amount of information that needs to travel down the wire to a minimum.

Emerging standards have been favoured over proprietary APIs to try and reduce unnecessary code duplication. For example I've intentionally not used Apple/Google/Microsoft link/meta tags for icon and home screen functionality. Instead I've chosen to use the less well supported web app manifest. Support for this should improve over time and it's not crucial for the site to function. I have used vendor specific fallbacks if the experience was completely broken without them.
