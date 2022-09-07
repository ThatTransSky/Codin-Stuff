const { SlashCommandBuilder } = require("@discordjs/builders")

//let requiredPermission = "MANAGE_MESSAGES"
module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the entire chat. Use with caution!")
    .setDefaultMemberPermissions(0x0000000000002000) // MANAGE_MEMBERS
    .addIntegerOption((option) => {
        return option
        .setName("amount")
        .setDescription("Amount of messages to delete. Between 1-99.")
        .setRequired(true)
    }),
async execute(interaction) {
    //const memberPermissions = interaction.member.permissions
    //const appPermissions = interaction.appPermissions
    try {
/*
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
        console.log(isNaN(Amount) || Amount == null);
        if (isNaN(Amount)){
            return interaction.reply({
                content: "**Amount has to be a number!**",
                ephemeral: true,
            })
        } else if (!(0 < Amount < 100)) {
            return interaction.reply({
                content: "**Please use a number between 1-99!**",
                ephemeral: true,
            })
        }
        console.log(Amount);
        const { size } = await interaction.channel.bulkDelete(Amount)
        await interaction.reply({
            content: `Successfully deleted ${size} messages!`,
            ephemeral: true,
        })
    } catch (err) {
        console.error(err);
        return
    }

    } 
}