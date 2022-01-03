const BanSystem = require("./scripts/ban_system")
const { client } = require("./scripts/misc_scripts")

require("dotenv").config()

let Commands = []

function CommandInit() {
    RegisterCommand(["say", "talk", "speak"], (info, args) => {
        if (args.length <= 0) return;

        let text = args.join(" ")

        console.log(`User : ${info.author.tag}, with ID : ${info.author.id}, requested the Bot to say ${text}`)
        info.channel.send(text)
        info.delete()
    })

    RegisterCommand(BanSystem.ban.identifier, BanSystem.ban.runnable)
    RegisterCommand(BanSystem.unban.identifier, BanSystem.unban.runnable)
}

function RegisterCommand(identifier, command) {
    let _identifier = identifier
    if (typeof identifier != "object") { _identifier = [identifier] }
    const registered = {
        identifer: _identifier,
        runnable: command
    }
    Commands.push(registered)
}

function GetCommand(command) {
    if (command == null) return
    let runnable

    Commands.forEach(cmd => {
        console.log(cmd)
        console.log(cmd.identifer[0])
        if (cmd.identifer.includes(command.command)) {
            console.log("Founded")
            runnable = cmd.runnable
        }
    })
    return runnable
}

function GetCommandFromString(content) {
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

CommandInit()

client.on("ready", () => {
    console.log(`Successfully logged in as ${client.user.tag}`)
})

client.on("messageCreate", (msg) => {
    if (msg.author.equals(client.user) && msg.author.bot) return

    let command = GetCommandFromString(msg.content)
    if (command.command != null) {
        let selectedCommand = GetCommand(command)
        if (selectedCommand != null) selectedCommand(client, msg, command.args)
    }
})

client.login(process.env.TOKEN)