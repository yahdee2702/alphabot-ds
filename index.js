const Discord = require("discord.js")
const fs = require("fs")

require("dotenv").config()

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
    ]
})

const Commands = {
    "say": (info, args) => {
        if (args.length <= 0) return;

        let text = args.join(" ")

        console.log(`User : ${info.author.tag}, with ID : ${info.author.id}, requested the Bot to say ${text}`)
        info.channel.send(text)
        info.delete()
    },
    "ban": (info, args) => {
        if (args.length <= 0) return;

        GetIDFromArray(args, (id) => {
            client.users.fetch(id.toString())
                .catch((err) => {
                    console.log("Invalid ID")
                    info.reply("Please Input a valid ID!")
                    console.error(err)
                })
                .then((user => {
                    BanUser(user, info)
                }))
        })
    },
    "unban": (info, args) => {
        if (args.length <= 0) return;

        GetIDFromArray(args, (id) => {
            client.users.fetch(id.toString())
                .catch((err) => {
                    console.log("Invalid ID")
                    info.reply("Please Input a valid ID!")
                    console.error(err)
                })
                .then((user => {
                    UnBanUser(user, info)
                }))
        })
    }
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

async function IsBanned(user) {
    const bannedJson = `${process.env.DataFolder}/banned_list.json`
    let ret = {
        condition: false,
        position: 0,
    }

    let data0 = await fs.readFileSync(bannedJson, "utf-8")

    let data = JSON.parse(data0.toString())
    let length = Object.keys(data).length

    for (let index = 1; index <= length; index++) {
        const data1 = data[index.toString()];
        if (data1.id == user.id) {
            ret.condition = true
            ret.position = index
            break
        }
    }

    return ret
}

function BanUser(user, msg) {
    const bannedJson = `${process.env.DataFolder}/banned_list.json`

    fs.readFile(bannedJson, "utf-8", async (err, data0) => {
        if (err) { throw err }

        let isBanned = await IsBanned(user)

        if (!isBanned.condition && msg != null) {
            console.log(`Successfully Banned user ${user.tag}.`)
            msg.reply(`Successfully Banned user <@!${user.id}>.`)
        } else {
            console.log(`Cannot Ban user ${user.tag} cause they are already banned.`)
            msg.reply(`Cannot Ban user <@!${user.id}> because they are already banned.`)
        }

        if (isBanned.condition) { return }

        let todayDate = new Date()
        let data = JSON.parse(data0.toString())
        let length = Object.keys(data).length

        let newData = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            date: todayDate.getTime()
        }

        data[length + 1] = newData
        UpdateBannedList(data)
    })
}

function UnBanUser(user, msg) {
    const bannedJson = `${process.env.DataFolder}/banned_list.json`

    fs.readFile(bannedJson, async (err, data0) => {
        let isBanned = await IsBanned(user)

        if (isBanned.condition && msg != null) {
            console.log(`Successfully Unbanned user ${user.tag}.`)
            msg.reply(`Successfully Unbanned user <@!${user.id}>.`)
        } else {
            console.log(`Cannot Unban user ${user.tag} because they are already unbanned.`)
            msg.reply(`Cannot Unban user <@!${user.id}> because they are already unbanned.`)
        }

        if (!isBanned.condition) { return }

        let data = JSON.parse(data0.toString())
        let length = Object.keys(data).length

        delete data[isBanned.position.toString()]

        for (let index = isBanned.position + 1; index <= length; index++) {
            const element = data[index.toString()]
            const newPos = (index - 1).toString()
            delete data[index.toString()]
            data[newPos] = element
        }
        UpdateBannedList(data)
    })
}

function UpdateBannedList(newData) {
    const bannedJson = `${process.env.DataFolder}/banned_list.json`
    let ret = JSON.stringify(newData)

    try {
        fs.writeFileSync(bannedJson, ret)
        console.log("Succesfully updated the banned list")
    } catch (err1) {
        console.error(err1)
    }
}

function GetCommand(content) {
    let commands = {
        command: "",
        args: []
    }

    let split = content.split(/\s+/)
    commands.command = split[0].split(process.env.prefix)[1]
    split.shift()
    commands.args = split

    return commands
}

client.on("ready", () => {
    console.log(`Successfully logged in as ${client.user.tag}`)

})

client.on("messageCreate", (msg) => {
    if (msg.author.equals(client.user) && msg.author.bot) return

    let command = GetCommand(msg.content)
    if (command.command != null) {
        let selectedCommand = Commands[command.command]
        if (selectedCommand != null) selectedCommand(msg, command.args)
    }
})

client.login(process.env.TOKEN)