const { SlashCommandBuilder } = require("@discordjs/builders")
/*
Command Name: "check-timeout"
Command Purpose: Replys with the specified user's timeout status.
Command Options (if any): 
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any): 
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("check-timeout") // Sets the name
    .setDescription("Checks a user's timeout status (if timed out at all).") // Sets the description
    // .setDefaultMemberPermissions(1 << 40) // Sets the required permissions (MODERATE_MEMBERS)
    .addUserOption((option) => {
        return option
        .setName("user")
        .setDescription("The User to check.")
        .setRequired(true)
    }),
    async execute(interaction) {
        try {
            const {client} = interaction
            const guildMembers = await interaction.guild.members
            const specifiedUser = interaction.options.getUser("user")
            const specifiedGuildMember = await guildMembers.fetch(specifiedUser).catch(error => {
                if (error.message.includes("Unknown Member")) {
                    console.log(`${specifiedUser.tag} does not exist in the guild.`)
                    return interaction.reply({
                        content: `The User in not currently in the Server.`,
                        ephemeral: true,
                    })
                } else {
                    console.log(error.message)
                    return interaction.reply({
                    content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
                    ephemeral: true,
                    })
                }
            })
            
            if (interaction.user.equals(specifiedUser)) {
                return interaction.reply({
                    content: "You're not timed out.",
                    ephemeral: true,
                })
            } else if (client.user.equals(specifiedUser)) {
                return interaction.reply({
                    content: "You do realize that I'm talking to you, right?",
                    ephemeral: true,
                })
            }
            if (!interaction.replied) {
                if (specifiedGuildMember.isCommunicationDisabled()) {
                    // Conversion to higher units of time.
                    let timeoutEndsMillisecons = specifiedGuildMember.communicationDisabledUntil - Date.now()
                    let timeoutEndsSeconds = Math.trunc(timeoutEndsMillisecons / 1000)
                    let timeoutEndsMinutes = Math.trunc(timeoutEndsSeconds / 60)
                    let timeoutEndsHours = Math.trunc(timeoutEndsMinutes / 60)
                    let timeoutEndsDays = Math.trunc(timeoutEndsHours / 24)
                    // Removal of excess digits.
                    timeoutEndsMillisecons %= 1000
                    timeoutEndsSeconds %= 60
                    timeoutEndsMinutes %= 60
                    timeoutEndsHours %= 24
                    return interaction.reply({
                        content: `${specifiedUser} is timed out for ${timeoutEndsDays} days, ${timeoutEndsHours} hours, ${timeoutEndsMinutes} minutes, ${timeoutEndsSeconds} seconds and ${timeoutEndsMillisecons} milliseconds.`
                    })
                } else {
                    return interaction.reply({
                        content: `${specifiedUser} isn't currently timed out.`
                    })
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}