# Tor Explorer

> Explore the Tor network in under 10k

An entry for the [10k Apart](https://a-k-apart.com/) contest. Tor Explorer allows you to view information on the individual nodes that make up the Tor network. It is essentially a rewrite of the existing [Atlas](https://atlas.torproject.org/) web app with some additional features such as pagination, the ability to save nodes to your favourites, increased performance, better accessibility/mobile support, offline functionality and not requiring JavaScript.

![Screenshot](http://i.imgur.com/mOb6mFm.jpg)

## Size

An average Tor Explorer page weighs in at just over 7k. If the browser has JavaScript enabled additional requests will be made for ~1.5k of JavaScript enhancements and a ~500 byte SVG. These are requested asynchronously and so do not block the page load. They are purely for progressive enhancements and the site is fully usable without JavaScript.

Including the asynchronously loaded enhancements the page is still under 10k (~9.5k). The equivalent Atlas pages tend to be around 480k.

I have kept the size down by not using any 3rd party libraries. Everything has been implemented in vanilla HTML, CSS and JavaScript. I've also done as much heavy lifting on the server as possible to keep the amount of information that needs to travel down the wire to a minimum.

Emerging standards have been favoured over proprietary APIs to try and reduce unnecessary code duplication. For example I've intentionally not used Apple/Google/Microsoft link/meta tags for icon and home screen functionality. Instead I've chosen to use the less well supported web app manifest. Support for this should improve over time and it's not crucial for the site to function. I have used vendor specific fallbacks in places where the experience was completely broken without them.

## Browser Support

Tor Explorer works in all modern browsers and I've taken care to not completely break the experience in older browsers that don't support the modern features used. I've also used media queries to give a good experience on devices of all different screen sizes.

<img width="400" src="https://i.imgur.com/OdoYz1V.png" />

Making sure to use well structured semantic markup throughout the application also means that it works well with text based browsers such as lynx.

<img width="820" src="http://i.imgur.com/Q1OSXfc.png" />

## Accessibility

I've tested the site with various tools such as a11y and also done my own real world testing with screen readers. I've added ARIA landmarks to make navigation easier and made sure to hide certain elements from the screen reader (such as ascii graphs) that can't reasonably be understood by them. Testing using a11y is still returning some warnings but from my own personal tests I think these can be safely ignored.

Making sure all information was accessible without JavaScript was also really important. The target audience for this application are people who are running Tor relays or are interested in the Tor network. These people are more likely to be more concerned with privacy than the average user and are therefore much more likely to have JavaScript disabled.

One thing I really wanted to be able to show without JavaScript was bandwidth graphs. Atlas uses the D3 JavaScript library to generate graphs which is about 124k on it's own. It seemed a bit excessive to add a 124k dependency to a 7k page for one feature so I tried to figure out a way to render the graphs server side. In the end I settled on rendering the graphs in ascii art. This meant the graphs were basically just text which is highly compressible by gzip and works well on text based browsers.

<img width="863" src="http://i.imgur.com/4DGEUbi.png" />

## Progressive Enhancement

With JavaScript enabled some feature detection code is ran and if the browser is capable, the ability to favourite nodes is enabled. This is something I find really useful as I regularly check the status of my node on Atlas and have to search for it every time.

Browsers/operating systems that support web app manifests will allow the web app to be installed as to the home screen and act like a native application. Support for this isn't great yet but should improve over time. It currently works very well with Chrome on Android.

If the browser supports service workers a service worker will silently cache all static assets in the background. It will also keep a copy of the latest data each time you visit the top 10 nodes or an individual node page. If you lose your internet connection in the future the service worker will pull relevant data out of it's cache if it's available and show a nice error page if not.

These three enhancements really compliment each other and allow for a very native app like experience that even works offline for modern devices.

<img width="2160" src="http://i.imgur.com/Ltkf40H.jpg" />
