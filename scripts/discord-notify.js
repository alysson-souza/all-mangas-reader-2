const axios = require("axios")

let id, token, subject, body, version, patch

/* Build variables from arguments */
const idIndex = process.argv.indexOf("--id")
if (idIndex > -1) {
    id = process.argv[idIndex + 1]
}

const tokenIndex = process.argv.indexOf("--token")
if (tokenIndex > -1) {
    token = process.argv[tokenIndex + 1]
}

const subjectIndex = process.argv.indexOf("--subject")
if (subjectIndex > -1) {
    subject = process.argv[subjectIndex + 1]
}

const bodyIndex = process.argv.indexOf("--body")
if (bodyIndex > -1) {
    body = process.argv[bodyIndex + 1]
}

const versionIndex = process.argv.indexOf("--version")
if (versionIndex > -1) {
    version = process.argv[versionIndex + 1]
}

const patchIndex = process.argv.indexOf("--patch")
if (patchIndex > -1) {
    patch = process.argv[patchIndex + 1]
}

if (!id || !token || !subject || !version || !patch) {
    console.log("Invalid params")
    process.exit(255)
}

let url = `https://discordapp.com/api/webhooks/${id}/${token}`

try {
    let message = {
        content: `<@&744261082067239093> Beta version ${version}.${patch} is now available`,
        username: "Beta Build Bot",
        embeds: [
            {
                title: subject,
                type: "rich",
                color: 327424,
                description: body
            }
        ]
    }

    axios.post(url, message)
} catch (error) {
    console.log(error)
}
