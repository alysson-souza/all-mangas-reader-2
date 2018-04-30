# All Mangas Reader V2

## What is All Mangas Reader
All Mangas Reader is a browser extension which is designed to help you read and follow mangas on a lot of manga websites. It's main features are :
* Read whole chapters on manga websites
* Follow mangas you like with your reading list
* Be notified when new chapters are published
* Order, classify mangas in your reading list
* A lot of supported websites

## Why a V2 ?
The first version, created in 2012, is no more maintained due to poor code design.
All Mangas Reader V2 has been created to solve the two main issues of the V1 : 
 - Chrome removed AMR from its store because of terms service violation. Since then, a lot of workarounds have been found to install AMR, but it is quite complicated to install.

All Mangas Reader V2 is supported by **Firefox, Chrome (Chromium, Canary), Opera**, and Edge once it will implement properly native Promises

 - The code was really difficult to maintain because of really long and unreadable files full of jQuery code without comments

**All Mangas Reader has been fully rewritten with modern standards (ES6 (Babel), Webpack, VueJS) and is well documented**


## Installation
To install All Mangas Reader, go to [the main website](https://allmangasreader.com) and choose which extension to install depending on your browser
**Extension is not packaged yet, to install, follow the developer installation**

## Developer installation
First clone this repository locally.
Build it using npm (if you don't have npm, [install it](https://www.npmjs.com/get-npm), you will need it or [yarn](https://yarnpkg.com)) : 
```
    npm run build:dev
```
This will create the deployable extension in the `dist` folder
Once done, you can install the extension as a temporary extension in the main browsers (please note that browsers may delete the associated database when the extension is temporal)

### Chrome
Go to [chrome://extensions/](chrome://extensions/) and switch to developer mode (in the top right hand corner). Click on **LOAD UNPACKED** and select the `dist` folder of your local repository. That's done !

### Firefox
Go to [about:debugging#addons](about:debugging#addons) and click on **Load temporal module**. Select the `manifest.json` file from the `dist` folder. That's done !

If you want to debug the extension while testing in Firefox, you will need web-ext. To install :
```
    npm i -g web-ext
```
To load firefox with All Mangas Reader in debug mode, execute the following command in the `dist` folder of your local repository :
```
    web-ext run
```

### Opera
Go to Menu > Extensions and click on **Load unpacked extension**. Select the `dist` folder of your local repository. That's done !

## Contribute
Before contributing to the project, please read [Contribution guide](CONTRIBUTING.md)
To contribute, fork the project and work on opened issues. Once fixed, submit a pull request which owners will merge as soon as possible

You can submit issues through GitLab issues tool. Please do not post issues related to mirrors implementation on this repository, do it on the [dedicated repository](https://gitlab.com/all-mangas-reader/all-mangas-reader-2-mirrors/issues)
Please submit a test case to reproduce your issue.

If you are not a developer, you can contribute as a translator too, to do so, clone the repository locally and work on the messages.json file in your language as explained in [this doc](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference)

You can also work on the [wiki](https://gitlab.com/all-mangas-reader/all-mangas-reader-2/wikis/) to help us explain to everyone how All Mangas Reader works


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

## License
All Mangas Reader is licensed under GPL V3
[View LICENSE FILE](LICENSE)