const path = require("path")
/**
 * Check if file is a png
 * @param {String} filePath
 * @returns {Boolean}
 */
exports.isPng = function (filePath) {
    return filePath.endsWith(".png")
}

/**
 * Check if file is already optimized
 * @param {Srting} filePath
 * @returns {Boolean}
 */
exports.isOptimzedPng = function (filePath) {
    const parsedFile = path.parse(filePath)
    return parsedFile.name.endsWith("-optimized") && parsedFile.ext === ".png"
}

/**
 * Rename file path to optimized file
 * @param {String} filePath
 * @returns {String}
 */
exports.renameToOptimized = function (filePath) {
    const newFileExt = ".png"
    const newFileName = path.parse(filePath).name + "-optimized" + newFileExt
    return path.join(path.parse(filePath).dir, newFileName)
}
