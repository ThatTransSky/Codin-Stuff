module.exports =  {
    name: "messageCreate",
    async execute (msg) {
        try {
            if (msg.content.toLowerCase() === "hi") {
            msg.reply({
                content: "Hello!",
                ephemeral: true,
            })
            console.log(`Event name \"MessageCreate\" triggered with messeage ${msg.content}`);

        } else {
            return
        }
    } catch (err) {
        console.error(err);
    }
    }
}