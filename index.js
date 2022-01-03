const { time } = require("console")
const Discord = require("discord.js")
const fs = require("fs")

require("dotenv").config()

class Command {
    constructor(cmd, args) {
        this.command = cmd
        this.args = args
    }
}

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
        const userRegex = Discord.MessageMentions.USERS_PATTERN

        let found = args.filter(value => value.match(userRegex) || Number(value))

        found.forEach(mention => {
            let id
            if (mention.match(userRegex) != null) {
                id = mention.slice(3).slice(0, -1)
            }
            else {
                id = mention
            }

            client.users.fetch(id.toString())
                .catch((err) => {
                    console.log("Invalid ID")
                    info.reply("Please Input a valid ID!")
                    console.error(err)
                })
                .then((user => {
                    BanUser(user, info)
                }))
        });
    }
}

async function IsBanned(user) {
    const bannedJson = `${process.env.DataFolder}/banned.json`
    let ret = false

    let data0 = await fs.readFileSync(bannedJson, "utf-8")

    let data = JSON.parse(data0.toString())
    let length = Object.keys(data).length

    for (let index = 1; index <= length; index++) {
        const data1 = data[index.toString()];
        if (data1.id == user.id) {
            ret = true
            break
        }
    }

    return ret
}

function BanUser(user, msg) {
    const bannedJson = `${process.env.DataFolder}/banned.json`
    fs.readFile(bannedJson, "utf-8", async (err, data0) => {
        if (err) { throw err }

        let isBanned = await IsBanned(user)

        if (!isBanned && msg != null) {
            console.log(`Successfully Banned user ${user.tag}.`)
            msg.reply(`Successfully Banned user <@!${user.id}>.`)
        } else {
            console.log(`Cannot Ban user ${user.tag} cause they are already banned.`)
            msg.reply(`Cannot Ban user <@!${user.id}> because they are already banned.`)
        }

        let todayDate = new Date()
        let data = JSON.parse(data0.toString())
        let length = Object.keys(data).length

        if (isBanned) {
            return
        }

        let newData = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            date: todayDate.getTime()
        }

        data[length + 1] = newData
        let ret = JSON.stringify(data)
        try {
            fs.writeFileSync(bannedJson, ret)
            console.log("Succesfully updated the banned list")
        } catch (err1) {
            console.error(err1)
        }
    })
}

function GetCommand(content) {
    let split = content.split(/\s+/)
    let cmd = split[0].split(process.env.prefix)[1]
    split.shift()
    let args = split

    return new Command(cmd, args)
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