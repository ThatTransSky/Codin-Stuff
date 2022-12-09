module.exports =  {
    name: "messageCreate",
    async execute (msg) {
        try {

            const msgChannel = msg.channel
            const msgContent = msg.content
            const author = msg.author
            if (!author.id !== process.env.CLIENT_ID) {
            console.log(`${author.username} (@${author.tag}) messaged "${msgContent}" in #${msgChannel.name}.`);
            } else {
                return
            }
        } catch (err) {
            console.error(err);
        }
    }
}