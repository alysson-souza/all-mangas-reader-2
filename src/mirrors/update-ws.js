const mirrors = './mirrors/'
const icons = './icons/'
const fs = require('fs')

let websites = []
let deprecated = ["isMe", "removeBanners", "whereDoIWriteNavigation", "nextChapterUrl", "previousChapterUrl", "isImageInOneCol", "getMangaSelectFromPage", "whereDoIWriteScans", "doSomethingBeforeWritingScans", "doAfterMangaLoaded"]
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

    website.disabled = object.disabled

    websites.push(website)
    let deps = []
    for (let dep of deprecated) {
        if (object[dep]) deps.push(dep)
    }
    if (deps.length > 0) {
        console.log(mirrorName + " : functions " + deps.join(", ") + " have been deprecated")
    }
}


/**
 * Write register_implementations.js file
 */
function writeWebsites(allAbstracts, allMirrors) {
    var json = JSON.stringify(websites, null, 2)
    let conditionalExec = ({def, impl, impls}) => {
        return `if ("${def.mirrorName}" === current ${def.type === "abstract" ? " || " + "[" + impls.map(n => '"' + n + '"').join(",") + "].includes(current)": ""} || !current) {
            ${impl}
        }`
    }
    let content = `
    const loadMirrors = function(current) {
        ${allAbstracts.map(conditionalExec).join("\n;")}
        ${allMirrors.map(conditionalExec).join("\n;")}
    }
    const websitesDescription = ${json};
    
    module.exports = { loadMirrors, websitesDescription };
    window["amrLoadMirrors"] = loadMirrors;
    `
    fs.writeFile('register_implementations.js', content, () => {})
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return "data:image/png;base64," +  Buffer.from(bitmap).toString('base64')
}

console.info("Starting mirror build")
fs.readdir(mirrors, async (err, files) => {
    let cur = 0
    let allMirrors = [], allAbstracts = []
    //sort files using case insensitive sort
    files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
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
                        let absInList = allAbstracts.find(({def}) => def.mirrorName === wsl.mirrorName)
                        if (absInList) {
                            absInList.def = wsl
                            absInList.impl = await fs.readFileSync(mirrors + file)
                        } else {
                            allAbstracts.push({def: wsl, impl: await fs.readFileSync(mirrors + file)})
                        }
                    } else {
                        allMirrors.push({def: wsl, impl: await fs.readFileSync(mirrors + file)})
                        if (wsl.abstract) {
                            let absInList = allAbstracts.find(({def}) => def.mirrorName === wsl.abstract)
                            if (absInList) {
                                if (!absInList.impls) absInList.impls = []
                                absInList.impls.push(wsl.mirrorName)
                            } else {
                                allAbstracts.push({def: {mirrorName: wsl.abstract}, impls: [wsl.mirrorName]})
                            }
                        }
                    }
                    resolve()
                } else setTimeout(wait, 10)
            })()
        })
    }
    writeWebsites(allAbstracts, allMirrors)
})

console.info("Mirror Rebuild Complete")

