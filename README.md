# ![](src/icons/icon_32.png) All Mangas Reader V2

## What is All Mangas Reader
All Mangas Reader is a browser extension which is designed to help you read and follow mangas on a lot of manga websites.

* Read whole chapters on manga websites
* Follow mangas you like with your reading list
* Be notified when new chapters are published
* Order, classify mangas in your reading list
* A lot of supported websites
* Synchronization across multiple devices

### Browser compatibilty
<table>
    <thead>
        <tr align="center">
            <th colspan="2"></th>
            <th colspan="1">Quantum</th>
            <th colspan="6">Chromium</th>
        </tr>
    </thead>
    <tbody>
    <tr align="center">
        <td colspan=2></td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Firefox_logo.png/255px-Firefox_logo.png" width="20" title="Firefox"/>
        </td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/512px-Google_Chrome_icon_%28September_2014%29.svg.png" width="16" title="Chrome"/>
        </td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/200px-Opera_2015_icon.svg.png" width="16" title="Opera"/>
        </td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Microsoft_Edge_Logo.svg/200px-Microsoft_Edge_Logo.svg.png" width="16" title="Edge Chromium"/>
        </td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Brave_lion.png" width="18" title="Brave"/>
        </td>
        <td>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Vivaldi_web_browser_logo.svg/200px-Vivaldi_web_browser_logo.svg.png" width="16" title="Vivaldi"/>
        </td>
        <td>
            <img src="https://play-lh.googleusercontent.com/IpPy16lik1fLrJs0fkaFuKrUm6Hw9Q3KDa2gLbewoze0Ko39gEIOyDECYOZBFJLHGeo=s180-rw" width="16" title="Kiwi Browser"/>
    </tr>
    <tr colspan="2" align="center">
        <td colspan=2><b>Desktop</b></td>
        <td>✔️</td>
        <td>✔️</td>
        <td>✔️</td>
        <td>✔️</td>
        <td>✔️</td>
        <td>✔️</td>
        <td>❌</td>
    </tr>
    <tr colspan="2" align="center">
        <td colspan=2><b>Mobile</b></td>
        <td>✔️</td>
        <td>❌</td>
        <td>❌</td>
        <td>❓</td>
        <td>❓</td>
        <td>❓</td>
        <td>✔️</td>
    </tr>
    </tbody>
</table>

#### 🔐 Privacy
All Mangas Reader can collect data for statistics purpose only. It keeps track of the manga you are reading and on which website you read it. These data are anonymized and are stored for at most 6 months on our own server, no google inside :). You can optout from this tracking by answering no to the question asked in the app at first time or from the options page.

## Installation

### Download
All Mangas Reader do not comply with Google Chrome Extensions terms of services, thus cannot be downloaded directly from their store.  
  - Stable : **[All Mangas Reader's main website](https://v2.allmangasreader.com)**
  - Beta
    - **[Firefox](https://release.allmangasreader.com/all-mangas-reader-beta-latest.xpi)**
    - **[Chromium](https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx)**
 
⚠️ **Chromium based browsers [need an additional step](#chromium-installation)** in order to install All Mangas Reader.  
**See [Browser compatibilty](#browser-compatibility) to check if your browser's based on Chromium.**

### Chromium installation

1. Navigate to **[All Mangas Reader's main website](https://v2.allmangasreader.com)** and click the download link for Opera and Chrome.
2. In the popup window right click the download button and click Save link as (in chrome) or Saved linked content as (Opera) and download the .crx file to somewhere on your computer.
3. Change the extension of the file from .crx to .zip (Optional for windows if you do not have winrar or 7zip installed which will unpack the file with a crx extension)
4. Extract the file using either the native archive program on your os or winrar/7zip.
5. Move this extracted folder to a location you wish to use for this extension, you will need to remember where this folder is in order to update the extension.
6. Open the extensions page in your browser, enable developer mode, and click load unpacked extension.
7. Select the folder you unpacked and you will have AMR installed.

### Chromium updates
1. Follow the steps in the [installation directions](#chromium-installation) to download and unpack the file (step 4).
2. Locate the folder you selected when you installed the extension.
3. Copy the contents from the updated folder into the folder you have located, Select to override the files if you get a prompt.
4. Open the extensions page on your browser and click the circle icon with an arrow in it to reload the extension with the latest updates.



### Synchronization

#### Browser Sync

*Browser sync* can be enabled under `Settings > General > Enable browser sync checkbox`

It uses your browser capabilities to synchronize your manga list:
- ✔️ 🖥️💻 <small>(Firefox)</small> **⬌** 🖥️💻 <small>(Firefox)</small>
- ✔️ 🖥️💻 <small>(Chrome)</small> **⬌** 🖥️💻 <small>(Chrome)</small>
- ❌ 🖥️💻 <small>(Chrome)</small> **⬌** 🖥️💻 <small>(Firefox)</small>
- etc ..

#### Synchronization with Gist (Github)
*Gist Sync* is an alernative method to synchornize your manga list. Useful when you need to synchronize across different browsers and operating systems :
- ✔️ 🖥️💻📱 <small>(any browser)</small> **⬌** 🖥️💻📱 <small>(any browser)</small>

##### In order to use the Gist Sync feature for All Mangas Reader, follow these instructions:  

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

ℹ️ ***Browser Sync* doesn't need to be enabled for *Gist Sync* to work.**

## Contribute
**❗ Before contributing to the project, please read our [Contribution guide](CONTRIBUTING.md).**

To contribute, fork the project and work on opened issues. Once fixed, submit a pull request which owners will merge as soon as possible

You can submit issues through GitLab issues tool, please submit a test case to reproduce your issue.

**If you are not a developer, you can contribute as a translator** too, to do so, clone the repository locally and work on the `messages.json` file in your language as explained in [this doc](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference).

You can also work on the [wiki](https://gitlab.com/all-mangas-reader/all-mangas-reader-2/wikis/) to help us explain to everyone how All Mangas Reader works.

### Developer installation
1. First clone this repository locally and install it using `yarn` (if you don't have yarn, [install it](https://yarnpkg.com)).
2. Install dependencies: `yarn install`
3. Build the extension (note that you will need to run this command when updating extension code) `yarn run build:dev`
4. This will create the deployable extension in the `dist` folder.
5. Once done, you can install the extension as a temporary extension in the main browsers (please note that browsers may delete the associated database when the extension is temporal)
    - **Chromium**: Go to Menu > Extensions and switch to developer mode (in the top right hand corner). Click on **LOAD UNPACKED** and select the `dist` folder of your local repository.
    - **Quantum**: Go to [about:debugging#addons](about:debugging#addons) and click on **Load temporal module**. Select the `manifest.json` file from the `dist`
        - ⚠️ If you want to debug the extension while testing you will need web-ext.
            `yarn global add web-ext`            
        - To load your browser with All Mangas Reader in debug mode, execute the following command in the `dist` folder of your local repository :
            `web-ext run`


⚠️ Syncing data using `browser.storage.sync` across different devices require same extension id on both devices.

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

### Firefox for Android
To test the extension while developing on Firefox for Android, install Firefox on your computer and adb, follow the steps in the [Set up your computer and Android emulator or device](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Developing_WebExtensions_for_Firefox_for_Android) to configure your debugging environment

1. Build the extension as [explained here](#developer-installation) (step 1 to 4)
2. Add the firefox app id by running `yarn manifest:specify -firefox`
3. Zip the `dist` folder and change the created file extension from `.zip` to `.xpi`
4. Push it to your phone or emulator (using `adb push ./dist-zip/all-mangas-reader-vXXX.xpi /mnt/sdcard/`)
5. Open Firefox on your phone and open (as an url) `file:///mnt/sdcard/`
6. Tap the extension file, it will install it !
7. You can now debug it using Firefox WebIDE and connect to your phone.
### Dependencies
 - Vue : One of the most popular reactive framework, Vue allows to create great UI
 - Vuex : Reactive store for vue, vuex organizes the data model properly
 - Vuetify : a set of UI components for view based on Material design
 - vuex-shared-mutations : a great plugin for Vuex which allows to synchronize vuex data model through different instances of Vue using localStorage events
 - webextension-polyfill : web extension API has been normalize and is implemented in Chrome, Firefox, Edge, ... but with still a few differences, thanks to this polyfill, the code works everywhere
 - axios : for xhr
 - jQuery : jQuery is still there, to manipulate DOM, it's still the best. Mirrors implementations are based on jQuery and the content script uses it as well.
 - dompurify to sanitize the dom before parsing it
 
### Dev dependencies
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

## For repository admins only
**Release version**

Beta channel is automatically updated on each commit.

Process to release a stable version : 
 - Commit version change with message `Update version to x.y.z before tag NO-CI`
    - CI will run on gitlab but webhook (which generates xpi and crx server side) will not consider artefacts as a version because of the `NO-CI` in commit message
    - **⚠️ Do not forget NO-CI**, if not, beta Vx.y.z.157 will be generated and will prevent next commits to create valid versions because after the version is tagged, beta version will start at 1 after the first commit after tag
 - Merge develop into master
 - Tag version on master (will generate release Vx.y.z when the tag CI runs on master)

## License
All Mangas Reader is licensed under GPL V3
[View LICENSE FILE](LICENSE)
