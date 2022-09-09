const { SlashCommandBuilder } = require("@discordjs/builders")
/*
Command Name: "unban"
Command Purpose: Revokes a user ban.
Command Options (if any):
- User_ID (String [cus discord is stupid] Option, Required)
- Reason (String Option, Default: No reason provided.)
Checks (if any):
- Is the User ID provided is valid and exists?
- Is the User ID provided the same as the Triggering User's ID?
- Is the User ID provided the same as the Bot's ID?
- Does the Guild have a ban associated with the User's ID?
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("unban") // Sets the name
    .setDescription("Revokes a user ban.") // Sets the description
    .setDefaultMemberPermissions(1 << 2) // Sets the required permissions (BAN_MEMBERS)
    .addStringOption((option) => { 
        return option
        .setName("user_id")
        .setDescription("Enter the User's ID.")
        .setRequired(true)
    })
    .addStringOption((option) => {
        return option
        .setName("reason")
        .setDescription("The Reason for Unbanning.")
    }),
    async execute(interaction) {
        try {
            // Funnels the provided aguments into variables.
            const client = interaction.client
            const user = await client.users.fetch(interaction.options.getString("user_id"))
            // ^This^ could very easily be replaced with getUser and let Discord handle the error.
            .catch(error => {
                console.log(error.message)
                if (error.message.includes(`Invalid Form Body`)) { // If the User ID is invalid
                    return interaction.reply({
                        content: `The User ID provided is invalid. (Error Message: ${error.message})`,
                        ephemeral: true,
                    })
                } else if (error.message.includes("Unknown User")) { // If the User ID doesn't exist
                    return interaction.reply({
                        content: `The User ID provided doesn't exist. (Error Message: ${error.message})`,
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
            let reason = interaction.options.getString("reason", false)
            const guildBans = interaction.guild.bans
    
            if (reason == null) {
                reason = "No reason provided."
            }
            // Not needed since the fetch() method basically checks both of these for me :3
            /*
            if (isNaN(user_id) || (user_id % 1) != 0) {
                return interaction.reply({
                    content: "The User ID provided is not a valid ID.",
                    ephemeral: true,
                })
            } else if ((typeof client.users.fetch(`${user_id}`)) === undefined) {
                return interaction.reply({
                    content: "The User ID provided doesn't exist.",
                    ephemeral: true,
                })
            */
            if (interaction.user.id === user.id) { // If the specified user = triggering user, end and notify the user.
                return interaction.reply({
                    content: "The user provided isn't--- Wait... You didn't really just try to unban yourself? *sigh* :person_facepalming:",
                    ephemeral: true,
                })
            } else if (client.user.id === user.id) { // You're talking to bot, why did you think the bot's banned?
                return interaction.reply({
                    content: "Hello? I'm- I'm right here. I'm not banned, am I?",
                    ephemeral: true,
                })
            } else {
                await guildBans.remove(user, reason)
                .catch(error => {
                    console.log(error.message)
                    return interaction.reply({
                        content: `There was an error unbanning this user. Are you sure the user is banned? (Error Message: ${error.message})`,
                        ephemeral: true,
                    })
                })
            }
            if (!interaction.replied) {
                console.log(`Successfully unbanned ${user.username} from ${interaction.guild.name}`)
                return interaction.reply({
                    content: `Successfully unbanned ${user.username}! :partying_face:`
                })
            }
        } catch (error) {
            console.log(error.message)
            return;
        }
    }
}