const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders")
/*
Command Name: "random-color"
Command Purpose: Replys with a random color (in hex format).
Command Options (if any): 
Required Permissions: none
Checks (if any): None
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("random-color") // Sets the name
    .setDescription("Gives you a random color."), // Sets the description
    async execute(interaction) {
        try {
            // Necessary constants
            const {client} = interaction
            const rgbColor = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)]
            const embed = new EmbedBuilder()
            .setColor([rgbColor[0], rgbColor[1], rgbColor[2]])
            .addFields({
                name: "Title", value: `Here's a random color: [${rgbColor}](https://www.thecolorapi.com/id?format=html&rgb=${rgbColor[0]},${rgbColor[1]},${rgbColor[2]})`
            })
            return interaction.reply({
                embeds: [embed.data],
            }).catch(error => {
                console.log(error.message)
                return interaction.reply({
                content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
                ephemeral: true,
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
}