const mirrors = './mirrors/'
const icons = './icons/'
const fs = require('fs')

let websites = []
let deprecated = ["isMe", "removeBanners", "whereDoIWriteNavigation", "nextChapterUrl", "previousChapterUrl", "isImageInOneCol", "getMangaSelectFromPage"]
global.window = {}

global.registerAbstractImplementation = function(mirrorName) {
    websites.push({
        mirrorName: mirrorName,
        type: "abstract"
    })
}
global.registerMangaObject = function(object) {
    let mirrorName = object.mirrorName
    let website = {}
    if (!object.mirrorName) {
        console.error(mirrorName + " : mirrorName is required !")
    }
    website.mirrorName = mirrorName
    if (!object.domains) {
        console.error(mirrorName + " : domains is required !")
    }
    website.domains = object.domains
    if (!object.languages) {
        console.error(mirrorName + " : languages is required !")
    }
    website.home = object.home
    if (!object.home) {
        console.error(mirrorName + " : home is required !")
    }
    website.languages = object.languages
    if (!object.mirrorIcon) {
        console.error(mirrorName + " : mirrorIcon is required !")
    }
    website.mirrorIcon = base64_encode(icons + object.mirrorIcon)
    if (object.abstract !== undefined) {
        website.abstract = object.abstract
    }
    if (object.chapter_url) {
        if (typeof object.chapter_url === "string") website.chapter_url = object.chapter_url
        else if (object.chapter_url instanceof RegExp) website.chapter_url = object.chapter_url.toString()
    }
    websites.push(website)
    let deps = []
    for (let dep of deprecated) {
        if (object[dep]) deps.push(dep)
    }
    if (deps.length > 0) {
        console.log(mirrorName + " : functions " + deps.join(", ") + " have been deprecated")
    }
}

fs.readdir(mirrors, async (err, files) => {
    let cur = 0
    let allMirrors = "", allAbstracts = ""
    for (let file of files) {
        require(mirrors + file)
        cur++
        await new Promise((resolve, reject) => {
            (async function wait() {
                if (cur === websites.length) {
                    websites[websites.length - 1].jsFile = mirrors.substring(2) + file;
                    websites[websites.length - 1].id = cur;
                    
                    let wsl = websites[websites.length - 1]
                    if (wsl.type === "abstract") {
                        allAbstracts += ";" + (await fs.readFileSync(mirrors + file)) + ";\n"
                    } else {
                        allMirrors += ";" + (await fs.readFileSync(mirrors + file)) + ";\n"
                    }
                    resolve()
                } else setTimeout(wait, 10)
            })()
        })
    }
    writeWebsites(allAbstracts, allMirrors)
})

/**
 * Write register_implementations.js file
 */
function writeWebsites(allAbstracts, allMirrors) {
    var json = JSON.stringify(websites, null, 2)
    let content = "const loadMirrors = function() {\n" + allAbstracts + allMirrors + "\n};\n\nconst websitesDescription = " + json + ";\n\nmodule.exports = { loadMirrors, websitesDescription };\n"
    fs.writeFile('register_implementations.js', content, () => {})
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return "data:image/png;base64," +  Buffer.from(bitmap).toString('base64')
}