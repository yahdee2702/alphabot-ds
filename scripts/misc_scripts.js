const Discord = require("discord.js")

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
    ]
})

function GetUserFromID(id) {
    return client.users.cache.find(user => user.id == id)
}

function GetIDFromArray(table, onfound) {
    const userRegex = Discord.MessageMentions.USERS_PATTERN
    const userTag = /^.{3,32}#[0-9]{4}$/

    let found = table.filter(value => value.match(userRegex) || value.match(userTag) || Number(value))
    let idArray = []

    found.forEach(mention => {
        let id
        if (mention.match(userRegex) != null) {
            id = mention.slice(3).slice(0, -1)
        } else if (mention.match(userTag) != null) {
            let user = client.users.cache.find(user => user.tag == mention)
            id = user.id
        }
        else {
            id = mention
        }
        idArray.unshift(id)

        if (onfound != null) { onfound(id) }
    });
    return idArray
}

module.exports = {
    GetUserFromID, GetIDFromArray, client
}