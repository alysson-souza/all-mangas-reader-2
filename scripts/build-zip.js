#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const zipFolder = require("zip-dir")
const exec = require("child_process").exec

const DEST_DIR = path.join(__dirname, "../dist")
const DEST_ZIP_DIR = path.join(__dirname, "../dist-zip")

const extractExtensionData = () => {
    const extPackageJson = require("../package.json")

    return {
        name: extPackageJson.name,
        version: extPackageJson.version
    }
}

const makeDestZipDirIfNotExists = () => {
    if (!fs.existsSync(DEST_ZIP_DIR)) {
        fs.mkdirSync(DEST_ZIP_DIR)
    }
}

const buildZip = async (src, dist, zipFilename) => {
    console.info(`Building ${zipFilename}...`)

    try {
        await zipFolder(src, { saveTo: path.join(dist, zipFilename) })
        console.info("OK")
    } catch (e) {
        console.error(e)
    }
}

const main = async () => {
    let { name, version } = extractExtensionData()
    let extension = ".zip"
    if (process.argv.includes("-xpi")) {
        extension = ".xpi"
    }

    if (process.argv.includes("-patch")) {
        const inc = process.argv[process.argv.findIndex(el => el === "-patch") + 1]
        version = version + "." + inc

        if (process.argv.includes("-alpha")) {
            name = name + "-alpha"
        } else {
            name = name + "-beta"
        }
    }

    const zipFilename = `${name}-${version}${extension}`

    makeDestZipDirIfNotExists()

    await buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)

    if (process.argv.includes("-push")) {
        console.log("Pushing to phone")
        exec(`adb push ./dist-zip/${zipFilename} /mnt/sdcard/`, (error, stdout, stderr) => {
            if (error) console.error(stderr)
            else console.log(stdout)
        })
    }
}

main()
