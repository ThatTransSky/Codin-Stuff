const { SlashCommandBuilder } = require("@discordjs/builders")
const ConfigFile = require("../handlers/ConfigHandler")
/*
Command Name: "config-update"
Command Purpose: Reads the Config file for the current guild and updates a given setting with the specified value.
Command Options (if any): 
- setting_name, Required String Option
- updated_value, String Option
Required Permissions: MANAGE_SERVER (1 << 5)
Checks (if any): 
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("config-update") // Sets the name
    .setDescription("Reads the Config file for the current guild and updates a given setting with the specified value.") // Sets the description
    .setDefaultMemberPermissions(1 << 5) // Sets the required permissions (1 << 5)
    .addStringOption((option) => {
        return option
        .setName('setting_name')
        .setDescription('The Name of the Setting that you want to view / update.')
        .addChoices({
            name: 'Logger\'s Channel ID',
            value: 'logChannelID'
        },
        {
            name: 'Testing Error Handling',
            value: 'non-existent'
        })
        .setRequired(true)
    })
    .addStringOption((option) => {
        return option
        .setName('updated_value')
        .setDescription('The new value of the specified setting')
    }),
    async execute(interaction) {
        try {
            // Necessary constants
            const {client} = interaction
            // REMINDER TO MYSELF: ^This^ extracts the Client
            // property OUT of the interaction.
            // const guildMembers = await interaction.guild.members
            await interaction.deferReply({
                ephemeral: true
            }).catch((error) => {console.error(error);})
            const config = new ConfigFile(interaction.guildId)
            const settingName = interaction.getStringOption('setting_name')
            const settingValue = config.getSetting(settingName)
            const updatedValue = interaction.getStringOption('update_value')
            if (typeof updatedValue === 'undefined')
                return await interaction.editReply({
                    content: `The setting \`${settingName}\` has the value of \`${settingValue}\`.`,
                    ehpemeral: true
                }).catch((error) => {
                    console.log(error.message)
                    return interaction.editReply({
                    content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
                    ephemeral: true,
                    })
                })
            else {
                try {
                    config.updateSetting(settingName, settingValue)
                    return await interaction.editReply({
                        content: `The setting \`${settingName}\`, which had the value of \`${settingValue}\`, now has the value of \`${updatedValue}\`.`,
                        epheremal: true
                    })
                } catch (error) {
                    console.log(error.message)
                    return await interaction.editReply({
                    content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
                    ephemeral: true,
                    })
                }
            }
        } catch (error) {
            console.log(error.message)
            return await interaction.editReply({
            content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
            ephemeral: true,
            })
        }
    }
}