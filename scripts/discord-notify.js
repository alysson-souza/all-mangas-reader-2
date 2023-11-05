let id, token, subject, body, version, patch, channel

/* Build variables from arguments */
const idIndex = process.argv.indexOf("--id")
if (idIndex > -1) {
    id = process.argv[idIndex + 1]
}

const channelIndex = process.argv.indexOf("--channel")
if (channelIndex > -1) {
    channel = process.argv[channelIndex + 1]
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

if (!id || !token || !subject || !version || !patch || (channel !== "Alpha" && channel != "Beta")) {
    console.log("Invalid params")
    process.exit(255)
}

const url = `https://discordapp.com/api/webhooks/${id}/${token}`

try {
    const message = {
        content: `<@&744261082067239093> ${channel} version ${version}.${patch} is now available`,
        username: `${channel} Build Bot`,
        embeds: [
            {
                title: subject,
                type: "rich",
                color: 327424,
                description: body
            }
        ]
    }

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    })
} catch (error) {
    console.log(error)
}
