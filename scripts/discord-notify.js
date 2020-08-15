const webhook = require("webhook-discord")

let id, token, subject, body, version

/* Build variables from arguments */
const idIndex = process.argv.indexOf('--id')
if (idIndex > -1) {
    id = process.argv[idIndex + 1]
}

const tokenIndex = process.argv.indexOf('--token')
if (tokenIndex > -1) {
    token = process.argv[tokenIndex + 1]
}

const subjectIndex = process.argv.indexOf('--subject')
if (subjectIndex > -1) {
    subject = process.argv[subjectIndex + 1]
}

const bodyIndex = process.argv.indexOf('--body')
if (bodyIndex > -1) {
    body = process.argv[bodyIndex + 1]
}

const versionIndex = process.argv.indexOf('--version')
if (versionIndex > -1) {
    version = process.argv[versionIndex + 1]
}

if (!id || !token || !subject || !version) {
    console.log('Invalid params')
    process.exit(255)
}

let url = `https://discordapp.com/api/webhooks/${id}/${token}`



try {
    let hook = new webhook.Webhook(url)
    let message = new webhook.MessageBuilder()
        .setName('Beta Builder')
        .setColor('#04ff00')
        .setText(`@beta_builds Beta version ${version} is now available`)
        .addField(subject, body || '')

    message.data.allowed_mentions = {
        roles: ["beta_builds"]
    }

    hook.send(message)

    
} catch(error) {
    console.log(error)
}