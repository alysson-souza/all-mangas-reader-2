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

All Mangas Reader V2 is supported by **Firefox, Chrom(ium/e), Opera**, and Edge once it will implement properly native Promises

 - The code was really difficult to maintain because of really long and unreadable files full of jQuery code without comments

**All Mangas Reader has been fully rewritten with modern standards (ES6, Webpack, VueJS) and is well documented**


## Installation
All Mangas Reader V2 has been package for Firefox, Chrom(ium/e) and Opera. You can find the links to download the stable version on **[All Mangas Reader's main website](https://v2.allmangasreader.com)**

Download Beta Channel:
 - **[All Mangas Reader Beta V2 for Firefox](https://release.allmangasreader.com/all-mangas-reader-beta-latest.xpi)**
 - **[All Mangas Reader Beta V2 for Chrom(ium/e) and Opera](https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx)**

Google Chrome disabled extensions which are not referenced in their store. All Mangas Reader does not comply with their terms of services and **will not be able to be published on Google's platform**

If you really want to have it in Chrom(ium/e), you will have to either follow the developer installation or to unzip the crx file and follow the developer installation / chrome instructions. Note that as it will be for development purpose, you may loose your local database doing that...

## Developer installation
First clone this repository locally and install it using `yarn` (if you don't have yarn, [install it](https://yarnpkg.com)).

Build the extension using yarn (note that you will need to run this command when updating extension code) `yarn run build:dev`

This will create the deployable extension in the `dist` folder.

Once done, you can install the extension as a temporary extension in the main browsers (please note that browsers may delete the associated database when the extension is temporal)

### Chrom(ium/e)
Go to [chrome://extensions/](chrome://extensions/) and switch to developer mode (in the top right hand corner). Click on **LOAD UNPACKED** and select the `dist` folder of your local repository. That's done !

### Firefox
Go to [about:debugging#addons](about:debugging#addons) and click on **Load temporal module**. Select the `manifest.json` file from the `dist` folder. That's done !

If you want to debug the extension while testing in Firefox, you will need web-ext. To install :
```
    yarn global add web-ext
```
To load firefox with All Mangas Reader in debug mode, execute the following command in the `dist` folder of your local repository :
```
    web-ext run
```

### Opera
Go to Menu > Extensions and click on **Load unpacked extension**. Select the `dist` folder of your local repository. That's done !

### Synchronisation

Sync can be enabled under `settings > general > Enable browser sync checkbox`

Syncing data using `browser.storage.sync` across different devices require same extension id on both devices.

extension id can be set in manifest.json
* for chrome - "key" field
* for firefox - "applications.gecko.id"

The easiest way to build and set know id by simply running two yarn commands
* `yarn build:dev && yarn manifest:specify -chrome`
* `yarn build:dev && yarn manifest:specify -firefox`

#### Caveats:

The above approach does not work very well during development as normally `yarn watch:dev` command is run to track changes and compile code, however it can cause the manifest to be reset and the `yarn build:dev && yarn manifest:specify` would need to be executed again.

As a temporary solution, the `manifest.json` file in src directly can be modified (BUT NOT COMMITTED) with either specific vendor changes.

Right fields can be copied from `dist/manifest.json` to `src/manifest.json` after running `yarn manifest:specify` command`


## Contribute
Before contributing to the project, please read [Contribution guide](CONTRIBUTING.md).

To contribute, fork the project and work on opened issues. Once fixed, submit a pull request which owners will merge as soon as possible

You can submit issues through GitLab issues tool. **Please do not post issues related to mirrors implementation on this repository, do it on the [dedicated repository](https://gitlab.com/all-mangas-reader/all-mangas-reader-2-mirrors/issues)**.

Please submit a test case to reproduce your issue.

If you are not a developer, you can contribute as a translator too, to do so, clone the repository locally and work on the **messages.json** file in your language as explained in [this doc](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference).

You can also work on the [wiki](https://gitlab.com/all-mangas-reader/all-mangas-reader-2/wikis/) to help us explain to everyone how All Mangas Reader works.


## Dependencies
 - Vue : One of the most popular reactive framework, Vue allows to create great UI
 - Vuex : Reactive store for vue, vuex organizes the data model properly
 - Vuetify : a set of UI components for view based on Material design
 - vuex-shared-mutations : a great plugin for Vuex which allows to synchronize vuex data model through different instances of Vue using localStorage events
 - webextension-polyfill : web extension API has been normalize and is implemented in Chrome, Firefox, Edge, ... but with still a few differences, thanks to this polyfill, the code works everywhere
 - axios : for xhr
 - jQuery : jQuery is still there, to manipulate DOM, it's still the best. Mirrors implementations are based on jQuery and the content script uses it as well.

## Dev dependencies
All Mangas Reader V2 is based on Webpack to compile the code.

## Release version
**For repository admins only**

Beta channel is automatically updated on each commit.

Process to release a stable version : 
 - commit version change with message 'Update version to x.y.z before tag NO-CI' : CI will run on gitlab but webhook (which generates xpi and crx server side) will not consider artefacts as a version because of the 'NO-CI' in commit message, do not forget NO-CI, if not, beta Vx.y.z.157 will be generated and will prevent next commits to create valid versions because after the version is tagged, beta version will start at 1 after the first commit after tag
 - merge develop into master
 - tag version on master (will generate release Vx.y.z when the tag CI runs on master)

## License
All Mangas Reader is licensed under GPL V3
[View LICENSE FILE](LICENSE)
