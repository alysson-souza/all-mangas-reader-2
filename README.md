# All Mangas Reader V2

## Why a V2 ?
All Mangas Reader is a browser extension which is designed to help you read and follow mangas on a lot of manga websites.
The first version, created in 2012, is no more maintained due to poor code design.
All Mangas Reader V2 has been created to solve the two main issues of the V1 : 
 - Chrome removed AMR from its store because of terms service violation. Since then, a lot of workarounds have been found to install AMR, but its more difficult to install.

**All Mangas Reader V2 is supported by Firefox, Chrome (Chromium, Canary), Opera**, and Edge once it will implement properly native Promises
 - The code was really difficult to maintain because of really long and unreadable files full of jQuery code without comments

**All Mangas Reader has been fully rewritten with modern standards (ES6 (Babel), Webpack, VueJS) and is well documented**

## Installation

## Contribute

## Dependencies
 - Vue : One of the most popular reactive framework, Vue allows to create great UI
 - Vuex : Reactive store for vue, vuex organizes the data model properly
 - Vuetify : a set of UI components for view based on Material design
 - vuex-shared-mutations : a great plugin for Vuex which allows to synchronize vuex data model through different instances of Vue using localStorage events
 - webextension-polyfill : web extension API has been normalize and is implemented in Chrome, Firefox, Edge, ... but with still a few differences, thanks to this polyfill, the code works everywhere
 - axios : for xhr
 - jQuery : jQuery is still there, to manipulate DOM, it's still the best. Mirrors implementations are based on jQuery and the content script uses it as well. We are stuck in jQuery 2.x.x because a lot of mirrors implementations are still using jQuery functions deprecated in jQuery 3.x (like size())
 - regenerator-runtime : the original Facebook plugin to execute ES6 async / await code. When Babel compiles async / await code, it generates references to this plugin. This one is way much lighter than the babel-polyfill which can do the same (and more) and is the reference implementation for babel as well.

## Dev dependencies
All Mangas Reader V2 is based on Webpack to compile the code. It uses Babel to compile EcmaScript 6 syntax, which is much more readable.