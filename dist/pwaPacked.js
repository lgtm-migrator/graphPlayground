!function(e){var n={};function t(r){if(n[r])return n[r].exports;var u=n[r]={i:r,l:!1,exports:{}};return e[r].call(u.exports,u,u.exports,t),u.l=!0,u.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=160)}({160:function(e,n,t){"use strict";var r=["index.html","bundle.js"];self.addEventListener("install",function(e){e.waitUntil(caches.open("graphs-v1").then(function(e){return e.addAll(r)}))}),self.addEventListener("fetch",function(e){e.respondWith(fetch(e.request).then(function(n){return e.request.url.includes("chrome-extension://")?n:caches.open("graphs-v1").then(function(t){var r=n.clone();return r.url.includes("data:")||t.put(e.request,r),n})}).catch(function(){return caches.match(e.request)}))})}});
//# sourceMappingURL=pwaPacked.js.map