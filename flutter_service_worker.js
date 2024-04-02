'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"icons/Icon-maskable-512.png": "6b35299d4fc50fcebb73eb932c4602df",
"icons/Icon-512.png": "4ee3f1d738227093fc70d663f91e5892",
"icons/Icon-192.png": "56f4de7eb9e876f9d70dc2d527531991",
"icons/Icon-maskable-192.png": "9dec69d424d0bf8be2a6fd90d9d156b2",
"require.js": "1565af44b896bc4c641f238fd800fc83",
"codemirror/css/codemirror.css": "05d0504a0124d330548b08ce840c7821",
"codemirror/codemirror.css": "a416d3257f5ca8dae10ad890495a7865",
"codemirror/codemirror.js": "60ce926a3813af7556c2af436dc28c1d",
"codemirror/LICENSE": "d935e58dfcf97600708f61e6da346b61",
"flutter_bootstrap.js": "35abe22274646a2950ae0ee283572312",
"manifest.json": "36b3d9b6e98ac3d26b1292c6a261ea72",
"frame.html": "0b79a9d6169a7c06fbd67dc94ed01ec5",
"main.dart.js": "2185b6462df205ab3fb270c33ac29a52",
"index.html": "14bfdf439d0fa7b277dbb48e2690c875",
"/": "14bfdf439d0fa7b277dbb48e2690c875",
"embed_demo.html": "95c714e7845def6d5b6a8bd20971c07f",
"frame.js": "a8646be80396d315b6006c6e1c9606c1",
"canvaskit/skwasm.js.symbols": "2ff12e3a905828b3ba32f43534f5e1c5",
"canvaskit/canvaskit.wasm": "0ce4a66c4dd5ebf3b13ba3c1d4497e49",
"canvaskit/canvaskit.js": "738255d00768497e86aa4ca510cce1e1",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"canvaskit/chromium/canvaskit.wasm": "70372064fdd1a5c362d275de4f6f5545",
"canvaskit/chromium/canvaskit.js": "901bb9e28fac643b7da75ecfd3339f3f",
"canvaskit/chromium/canvaskit.js.symbols": "12b4a72c095c8262cc92443acca219b2",
"canvaskit/canvaskit.js.symbols": "9bc52093d9406cd9b78b673ee6af9377",
"canvaskit/skwasm.js": "f17a293d422e2c0b3a04962e68236cc2",
"canvaskit/skwasm.wasm": "0174a49453d5c742565a9c6b76ff0117",
"styles/cm-dartpad-light.css": "6a94f3eb3e9e7166eef8276779ac98c7",
"styles/cm-dartpad-dark.css": "2a72a54d7e4bf68f66ded1d639aba80f",
"version.json": "9dc66a8ed06782304265e9814712320b",
"assets/AssetManifest.bin.json": "cd9d7a7493b42fcbb10606a644604a4b",
"assets/AssetManifest.json": "2efbb41d7877d10aac9d091f58ccd7b9",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "f565345b7fbd62355ff09a02846c140f",
"assets/assets/dart_logo_192.png": "56f4de7eb9e876f9d70dc2d527531991",
"assets/assets/flame_logo_192.png": "3e135d2716e2995472b9a7152023e663",
"assets/assets/gemini_sparkle_192.png": "fc4f1c3c914caf4c789fa7c800b3b11d",
"assets/assets/fonts/RobotoMono-Regular.ttf": "5b04fdfec4c8c36e8ca574e40b7148bb",
"assets/assets/fonts/RobotoMono-Bold.ttf": "90190d91283189e340b2a44fe560f2cd",
"assets/assets/flutter_logo_192.png": "6ba940675e2cd74bde86ba0bd4201309",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin": "693635b5258fe5f1cda720cf224f158c",
"flutter.js": "383e55f7f3cce5be08fcf1f3881f585c",
"favicon.png": "c3ce0cac0f74c34597ce4275b2f9f4e4"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
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
        // Claim client to enable caching on first launch
        self.clients.claim();
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
      // Claim client to enable caching on first launch
      self.clients.claim();
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
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
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
