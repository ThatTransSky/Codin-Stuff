module.exports =  {
    name: "messageCreate",
    async execute (msg) {
        console.log(`Event name \"MessageCreate\" triggered with messeage ${msg.content}`);
        try {
            if (msg.content.toLowerCase() === "hi") {
            msg.reply({
                content: "Hello!",
                ephemeral: true,
            })

        }
    } catch (err) {
        console.error(err);
    }
    }
}