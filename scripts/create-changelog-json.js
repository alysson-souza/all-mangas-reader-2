/**
 * Update the manifest.json file from dist folder to create a releasable extension :
 * Options are :
 *  -checkver x: prior to anything else, check if the version in the manifest is equal to the given argument, and fail with exit code 255 if not
 *  -patch x : number that will be added to the current version number (if current version is 2.0.0 and x is 67, generated version will be 2.0.0.67). If is specified, the generated extension will be supposed to update on the beta channel and "Beta" will be added to the extension name
 *  -chrome : if option is present, manifest will be adapted for chrome needs
 *  -firefox : if option is present, manifest will be adapted for firefox needs
 */
const fs = require("fs")
const path = require("path")

const ChangelogParser = require("changelog-parser")

ChangelogParser(path.join(__dirname, "../CHANGELOG.md")).then(function (res) {
    fs.writeFile(path.join(__dirname, "../changelog.json"), JSON.stringify(res), function (err) {
        if (err) return console.log(err)
        console.log("Changelog file built")
    })
})
