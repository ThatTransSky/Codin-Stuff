let { SlashCommandBuilder } = require("@discordjs/builders")
/* 
Command Name: "uptime"
Command Purpose: Show the bot's current uptime.
Command Options (if any): None
Checks (if any): None
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows how long have the bot been online for."),
    async execute(interaction) {
        // Conversion to higher units of time.
        const client = interaction.client
        let uptimeMilliseconds = client.uptime
        let uptimeSeconds = Math.trunc(uptimeMilliseconds / 1000)
        let uptimeMinutes = Math.trunc(uptimeSeconds / 60)
        let uptimeHours = Math.trunc(uptimeMinutes / 60)
        let uptimeDays = Math.trunc(uptimeHours / 24)
        // Removal of excess digits.
        uptimeMilliseconds %= 1000
        uptimeSeconds %= 60
        uptimeMinutes %= 60
        uptimeHours %= 24
        return interaction.reply({
            content: `I have been running for ${uptimeDays} days, ${uptimeHours} hours, ${uptimeMinutes} minutes, ${uptimeSeconds} seconds and ${uptimeMilliseconds} milliseconds.`,
            ephemeral: true,
        }).catch(error => {
            console.log(error)
            return interaction.reply({
                content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error code: ${error.code})`,
                ephemeral: true,
            })
        })
    } 
}