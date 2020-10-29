module.exports = {
    name: "ping",
    execute(client, message, args) {
        message.channel.send(`Pong! \`${Date.now() - message.createdTimestamp}ms\``);
    }
}