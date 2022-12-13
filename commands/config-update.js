const { SlashCommandBuilder } = require('@discordjs/builders');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "config-update"
Command Purpose: Reads the Config file for the current guild and updates a given setting with the specified value.
Command Options (if any): 
- setting_name, Required String Option
- updated_value, String Option
Required Permissions: MANAGE_GUILD (1 << 5)
Checks (if any): 
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-update') // Sets the name
    .setDescription(
      'Reads the Config file for the current guild and updates a given setting with the specified value.',
    ) // Sets the description
    .setDefaultMemberPermissions(1 << 5) // Sets the required permissions (MANAGE_GUILD)
    .addStringOption((option) => {
      return option
        .setName('setting_name')
        .setDescription('The Name of the Setting that you want to view / update.')
        .addChoices(
          {
            name: "Logger's Channel ID",
            value: 'logChannelID',
          },
          {
            name: 'Testing Error Handling',
            value: 'non-existent',
          },
        )
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('updated_value')
        .setDescription('The new value of the specified setting');
    }),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      try {
        const config = new ConfigFile(interaction.guildId);
        const settingName = interaction.options.getString('setting_name');
        const settingValue = config.getSetting(settingName);
        const updatedValue = interaction.options.getString('updated_value');
        if (updatedValue === null) {
          return await interaction.editReply({
            content: `The setting \`${settingName}\` has the value of \` ${settingValue} \`.`,
            ehpemeral: true,
          });
        } else {
          try {
            config.updateSetting(settingName, updatedValue);
            return await interaction.editReply({
              content: `The setting \`${settingName}\`, which had the value of \` ${settingValue} \`, now has the value of \` ${updatedValue} \`.`,
              epheremal: true,
            });
          } catch (err) {
            const errObject = new ErrorHandler(err.message, err.code, 'config_update');
            if (errObject.shouldExit) {
              return await interaction.editReply({
                content: errObject.message,
                ephemeral: true,
              });
            } else console.log(errObject.message);
          }
        }
      } catch (err) {
        const errObject = new ErrorHandler(err.message, err.code, 'config_update');
        if (errObject.shouldExit) {
          return await interaction.editReply({
            content: errObject.message,
            ephemeral: true,
          });
        } else console.log(errObject.message);
      }
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'config_update');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
