const { SlashCommandBuilder } = require("@discordjs/builders")
/* 
Command Name: "clear"
Command purpose: Clears messages in a channel with a specified amount.
Command Options:
- Amount (Integer Option, Required)
Required Permissions: MANAGE_MESSAGES (1 << 13)
Checks (if any):
- Is the amount an Integer? (deprecated since the option is Integer only but I'm paranoid so ¯\_(ツ)_/¯).
- Is the amount between 1-99? (99 is the limit with BulkDeletion)
Note: If the message deletion returns an unhandled error,
      I let the user know to contact me with that error code
      so I can see what went wrong and update the code.
*/

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear") // Sets the name.
    .setDescription("Clears an amount of messages in the current channel. Use with caution!") // Sets the description.
    .setDefaultMemberPermissions(1 << 13) // Sets the required permissions.
    .addIntegerOption((option) => { // Adds the options.
        return option
        .setName("amount")
        .setDescription("Amount of messages to delete. Between 1-99.")
        .setRequired(true) // Sets the option as required.
    }),
async execute(interaction) { // Executes the command.
    try {
        // Old command permission checking (both user & bot)
/*
        const memberPermissions = interaction.member.permissions
        const appPermissions = interaction.appPermissions
        console.log(memberPermissions.has(requiredPermission))
        console.log(appPermissions.has(requiredPermission))
        if(!memberPermissions.has(requiredPermission)) {
            console.log(`The user ${interaction.user.tag} lacked the required permission ${requiredPermission}`);
            return interaction.reply({
                content: "You don't have the required permissions to use this command.",
                ephemeral: true,
            })} 

        if(!appPermissions.has(requiredPermission)) {
            console.log(`The bot lacks permission ${requiredPermission}`);
            return interaction.reply({
                content: "I don't have the required permissions to use this.",
                ephemeral: true,
            })}
*/
        const Amount = interaction.options.getInteger("amount")
        if (isNaN(Amount) || (Amount % 1) != 0){ // If you get this response, let me know on discord (ItsLegend#9697).
            return interaction.reply({
                content: "**Amount has to be an Integer!**",
                ephemeral: true,
            })
        } else if (!(0 < Amount < 100)) { // If the number is below 1 or above 99, end and notify the user.
            return interaction.reply({
                content: "**Please use a number between 1-99!**",
                ephemeral: true,
            })
        }
        // console.log(Amount)
        const { size } = await interaction.channel.bulkDelete(Amount) // Wait for the message deletion to complete and get the amount of messages deleted.
        await interaction.reply({
            content: `Successfully deleted ${size} messages!`,
            ephemeral: true,
        }).catch(error => { // This is here incase there are any unhandled errors. It is to prevent the bot from crashing by an error.
            console.log(error)
            return interaction.reply({
                content: `Oops! There's been an error clearing the messages. That's a bit unexpected. Can you contact my creator (ItsLegend#9697) with this error code? (Error Code: ${error.code}`,
                ephemeral: true,
            })
        })
    } catch (err) {
        console.error(err);
        return
    }

    } 
}