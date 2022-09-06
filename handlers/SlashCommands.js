// Not used & is still a WIP.

const { fs } = require("fs")

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f => f.endsWith(ending))
}

module.exports = (bot, reload) => {
    const { client } = bot

    let slashcommands = getFiles("./commands/", ".js")

    if (slashcommands.length === 0)
        console.log("No Commands Loaded.");

    slashcommands.forEach(f => {
        if (reload) delete require.cache[require.resolve(`../commands/${f}`)]
        const slashcmd = require(`../commands/${f}`)

        client.slashcommands.set(slashcmd.name, slashcmd)
    });
}