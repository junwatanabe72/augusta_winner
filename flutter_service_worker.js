'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "8382e9a9584b3c174cd0823f26d67673",
"index.html": "f72adc8fae15d0721603b413d10795a8",
"/": "f72adc8fae15d0721603b413d10795a8",
"apple-touch-icon.png": "db031ac4608057414b897201a1aecccd",
"main.dart.js": "6707763a8e46d2a1718560bd88b7fa27",
"favicon.png": "db031ac4608057414b897201a1aecccd",
"icons/Icon-192.png": "9c284c3b2d3df53b3b996634f98faf75",
"icons/Icon-512.png": "eb3b9aab23a2a92ab4143a46a1062d13",
"icons/219.png": "db031ac4608057414b897201a1aecccd",
"manifest.json": "b9900c2d6adab84d227c95ed292426e7",
"assets/AssetManifest.json": "25bf4464b66dee866d1c566674255cd0",
"assets/NOTICES": "bc64b245b0d9b8f819afcbf0a5f074d4",
"assets/FontManifest.json": "c0c733f2f6e5d42904dbe1ead358f61c",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/eva_icons_flutter/lib/fonts/evaicons.ttf": "b600c99b39c9837f405131463e91f61a",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/flags/ar.png": "cf2d5683b80123ef7d7964a745a53d96",
"assets/assets/flags/us.png": "475fb15a34544a3d3e52afde0f29eb3d",
"assets/assets/flags/au.png": "19b7a29c62bda7b35d2660bb749cafdf",
"assets/assets/flags/sc.png": "ea0309fb3fc84f788246065382a943f4",
"assets/assets/flags/en.png": "d25c15be38f566d48e61b6ab71dc0905",
"assets/assets/flags/jp.png": "147970e61b245bcc91ad4cc89443f9d3",
"assets/assets/flags/es.png": "1da639d77ca00d8834f9e61d74dc21d0",
"assets/assets/flags/fj.png": "c6fbda831fe4bdd2b749ee88c301059e",
"assets/assets/flags/de.png": "0520119bf2f308ee9c930635df0d841c",
"assets/assets/flags/wa.png": "1aba78aa28f16a924a26b25d4e580769",
"assets/assets/flags/ca.png": "bbab46304db217176eb96a0d6d524411",
"assets/assets/flags/za.png": "f91617a6236667ee67558cdb71d89a79",
"assets/assets/sinproject-nameless.png": "5e5010d235ab3ee2cfc66ebe0a228011",
"assets/assets/sounds/gameClear.mp3": "0a8f8021a779baa753eb55028b314674",
"assets/assets/sounds/incorrect.mp3": "128d7c3fda8719a1144ca02eae1ac636",
"assets/assets/sounds/correct.mp3": "327398cf406c26957d79628a73364758",
"assets/assets/sounds/main.mp3": "e48949cfa2e5002560ec3fcb7b573386",
"assets/assets/backgroundImage.png": "cb4f162847899c1f32657150f3709869",
"assets/assets/logo.png": "f236516f21c0f6cdf2bbd4b60310c766",
"assets/assets/sinproject.png": "46da728a43b0616af5e3c6d56841cdd8",
"assets/assets/translations/ja.json": "04c7a9879a7d1c3d33043c2f2050e6a7",
"assets/assets/translations/en.json": "44d0a63136ce9ff6e513f68b2cd7fcf0"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
