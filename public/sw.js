importScripts('workbox-sw.prod.v2.1.2.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "build/workbox-sw.prod.v2.1.2.js.map",
    "revision": "8e170beaf8b748367396e6039c808c74"
  },
  {
    "url": "firebase-messaging-sw.js",
    "revision": "8eda39d80bf674689e5eb6e20def17ad"
  },
  {
    "url": "images/background.jpg",
    "revision": "e3479931a25ba27330ea72d6c37d2bd1"
  },
  {
    "url": "images/e.jpg",
    "revision": "07f0bcdc023b65a81326c01ab228144c"
  },
  {
    "url": "images/logo.png",
    "revision": "12390194d9e9641c4ae22666e243e5b5"
  },
  {
    "url": "images/office.jpg",
    "revision": "028b1cea03d9ab5a9b2ba6bae3c8e0d4"
  },
  {
    "url": "images/s.jpg",
    "revision": "80352ce8b9370e4835bfd7224927e289"
  },
  {
    "url": "images/touch/manifest144.jpg",
    "revision": "7e32d879b7e6987dc75c04a1f154f4cd"
  },
  {
    "url": "images/touch/manifest168.jpg",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "images/touch/manifest192.jpg",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "images/touch/manifest48.jpg",
    "revision": "0e676f5f7b5ff84c070241942da9a794"
  },
  {
    "url": "images/touch/manifest512.jpg",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "images/touch/manifest72.jpg",
    "revision": "d49621f8d9862c3f35a62a54108b877d"
  },
  {
    "url": "images/touch/manifest96.jpg",
    "revision": "65c2d798b9fdc2f0c58843e6547ed5c4"
  },
  {
    "url": "images/yuna.jpg",
    "revision": "3ae8a15540e83f57d6d87368a7951170"
  },
  {
    "url": "index.html",
    "revision": "66f6211b9276a1b3255ec970417cbbd2"
  },
  {
    "url": "manifest.json",
    "revision": "eca6bc0a0465a47ce51b22316662f7e6"
  },
  {
    "url": "partials/addFridge.html",
    "revision": "7036a70721d25872d413df9dc6874620"
  },
  {
    "url": "partials/changeEmail.html",
    "revision": "ab98fc1c273a83ba1fc24be90d7df163"
  },
  {
    "url": "partials/changeName.html",
    "revision": "fc5394aecf135973419ab3b590543f17"
  },
  {
    "url": "partials/changePassword.html",
    "revision": "36b101fe60f13270edbbb09ce2f2bcce"
  },
  {
    "url": "partials/introAddItem.html",
    "revision": "e0a6afff117a3675797998ad4b8cfddf"
  },
  {
    "url": "partials/modalAddItem.html",
    "revision": "31f69f68870aa181b09c598c4ab2e229"
  },
  {
    "url": "partials/myFridge.html",
    "revision": "a8fd2003b74d81b0f01da2c35d2a8866"
  },
  {
    "url": "partials/myFridgeEmpty.html",
    "revision": "3b5fdc3899cc5cf6e818ee7f9fd54663"
  },
  {
    "url": "partials/myFridgeFull.html",
    "revision": "34601726f9a69b07e4c8854c6031c8f8"
  },
  {
    "url": "partials/setting.html",
    "revision": "ac1aceb0f99bda492812afdb768214e9"
  },
  {
    "url": "partials/storeaccounts.html",
    "revision": "e5deb127b9263617bf4f8ec9d887e9c7"
  },
  {
    "url": "scripts/app.js",
    "revision": "4edffd6576cce4fa5be5a27fc4b6ad3a"
  },
  {
    "url": "scripts/example-app.js",
    "revision": "46f6d2ae5f9e65c7fda5d24ffc0b3a5b"
  },
  {
    "url": "scripts/itemslide.js",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "styles/style.css",
    "revision": "9ae743d301f7e199f3cf4a1cf1536ef6"
  },
  {
    "url": "sw.js",
    "revision": "eaa20e9528aeb2b232e94a4e7fd86f17"
  },
  {
    "url": "workbox-sw.prod.v2.1.2.js",
    "revision": "685d1ceb6b9a9f94aacf71d6aeef8b51"
  },
  {
    "url": "workbox-sw.prod.v2.1.2.js.map",
    "revision": "8e170beaf8b748367396e6039c808c74"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
