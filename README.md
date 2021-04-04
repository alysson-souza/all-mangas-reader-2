# All Mangas Reader V2

## What is All Mangas Reader
All Mangas Reader is a browser extension which is designed to help you read and follow mangas on a lot of manga websites. It's main features are :
* Read whole chapters on manga websites
* Follow mangas you like with your reading list
* Be notified when new chapters are published
* Order, classify mangas in your reading list
* A lot of supported websites

**Privacy** : All Mangas Reader can collect data for statistics purpose only. It keeps track of the manga you are reading and on which website you read it. These data are anonymized and are stored for at most 6 months on our own server, no google inside :). You can optout from this thracking by answering no to the question asked in the app at first time or from the options page.

## Why a V2 ?
The first version, created in 2012, is no more maintained due to poor code design.
All Mangas Reader V2 has been created to solve the two main issues of the V1 : 
 - Chrome removed AMR from its store because of terms service violation. Since then, a lot of workarounds have been found to install AMR, but it is quite complicated to install.

All Mangas Reader V2 is supported by **Firefox, Chrom(ium/e), Opera**, and Edge once it will implement properly native Promises

 - The code was really difficult to maintain because of really long and unreadable files full of jQuery code without comments

**All Mangas Reader has been fully rewritten with modern standards (ES6, Webpack, VueJS) and is well documented**


## Installation
All Mangas Reader V2 has been package for Firefox, Chrom(ium/e) and Opera. You can find the links to download the stable version on **[All Mangas Reader's main website](https://v2.allmangasreader.com)**
As Edge is now based on Chromium, it should work with Edge.

Download Beta Channel:
 - **[All Mangas Reader Beta V2 for Firefox](https://release.allmangasreader.com/all-mangas-reader-beta-latest.xpi)**
 - **[All Mangas Reader Beta V2 for Chrom(ium/e) and Opera](https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx)**

Google Chrome disabled extensions which are not referenced in their store. All Mangas Reader does not comply with their terms of services and **will not be able to be published on Google's platform**

If you really want to have it in Chrom(ium/e), you will have to either follow the developer installation or to unzip the crx file and follow the developer installation / chrome instructions. Note that as it will be for development purpose, you may loose your local database doing that...

## Chrom(ium/e) installation
Navigate to **[All Mangas Reader's main website](https://v2.allmangasreader.com)** and click the download link for Opera and Chrome.

In the popup window right click the download button and click Save link as (in chrome) or Saved linked content as (Opera) and download the .crx file to somewhere on your computer.

Change the extension of the file from .crx to .zip (Optional for windows if you do not have winrar or 7zip installed which will unpack the file with a crx extension)

Extract the file using either the native archive program on your os or winrar/7zip.

Move this extracted folder to a location you wish to use for this extension, you will need to remember where this folder is in order to update the extension.

Open the extensions page in your browser, enable developer mode, and click load unpacked extension.

Select the folder you unpacked and you will have AMR installed.

## Chrom(ium/e) Updates
Follow the steps in the installation directions to download and unpack the file.

Locate the folder you selected when you installed the extension.

Copy the contents from the updated folder into the folder you have located, Select to override the files if you get a prompt.

Open the extensions page on your browser and click the circle icon with an arrow in it to reload the extension with the latest updates.

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

#### Synchronisation with Gist (Github)

In order to use the Gist Sync feature for All Mangas Reader, follow these instructions:  

1. If you do not have a GitHub account create one at [github.com](https://github.com/)
2. Create a Gist at [gist.github.com](https://gist.github.com/)
    1. In order to create a Gist you have to fill in a description, a file name and its content. It does not matter what the values are.
    2. Once created the URL will change to `gist.github.com/<username>/<Gist ID>`, capture the Gist ID from the URL
3. Create a Personal Access Token
    1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) and click on "Generate new token".
    2. Fill in the "Note" field with what you want, e.g. "AMR".
    3. Check the "gist" checkbox
    4. Click "Generate Token". **BE SURE TO CAPTURE THE TOKEN** when it is generated as you will not be able to review the token later.  If you did not capture the token, then you will need to generate a new token.
4. Enable Gist Sync in All Mangas Reader
    1. Personal access token is the code captured in Step 3 above.
    2. Gist ID is the ID captured from Step 2 above
5. Once all of the Gist Sync fields are populated, All Mangas Reader will initiate a synch with Gist.
    1. There should be a new file named "amr.json" in your Gist which contain your sync data.
    2. If you need to verify that data has been transfered, then open the Gist and review the Revision history.
6. Enable Gist Sync in All Mangas Reader for all other devices. Use the same Personal Access Token and Gist ID that were captured earlier.

### Firefox for Android
To test the extension while developing on Firefox for Android, install Firefox on your computer and adb, follow the steps in the [Set up your computer and Android emulator or device](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Developing_WebExtensions_for_Firefox_for_Android) to configure your debugging environment

Then, build the extension using `yarn run android:dev`, this will :
* build the extension like usual,
* add the firefox app id
* then zip the `dist` folder and rename the created file to an xpi file
* finally push it to your phone or emulator (using `adb push ./dist-zip/all-mangas-reader-vXXX.xpi /mnt/sdcard/`)

The extension is on your phone, in Firefox for Android, open `file:///mnt/sdcard/` and tap on the extension file, it will install it ! You can debug it using Firefox WebIDE and connect to your phone.

## Contribute
Before contributing to the project, please read [Contribution guide](CONTRIBUTING.md).

To contribute, fork the project and work on opened issues. Once fixed, submit a pull request which owners will merge as soon as possible

You can submit issues through GitLab issues tool.

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
 - dompurify to sanitize the dom before parsing it
 
## Dev dependencies
All Mangas Reader V2 is based on Webpack to compile the code.

### Integration with Vue devtools
Make sure "Allow access to file URLs" is enabled
Install [Vue Remote tools](https://github.com/vuejs/vue-devtools/blob/master/shells/electron/README.md)

if you installed vue-devtools globally, run it with `vue-devtools`
Open AMR popup, vue-devtools should now be connected

Change content_security_policy in manifest.json to
`"content_security_policy": "script-src 'self' 'unsafe-eval' http://localhost:8098 'unsafe-inline'; object-src 'self'",`

**Note**: Browser extension does not work due to security restrictions
```
Unchecked runtime.lastError while running tabs.executeScript: Cannot access a chrome-extension:// URL of different extension
```

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
