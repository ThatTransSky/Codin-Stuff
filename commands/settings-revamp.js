const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "settings-revamp"
Command Purpose: Reads the Config file for the current guild and updates a given setting with the specified value.
Command Options (if any): 
- setting_name, Required String Option
- updated_value, String Option
Required Permissions: MANAGE_GUILD (1 << 5)
Checks (if any): 
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings-revamp') // Sets the name
    .setDescription(
      'Reads the Config file for the current guild and updates a given setting with the specified value.',
    ), // Sets the description
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: true, // Always Ephemeral because it's a config command :)
      });
      const selectMenuRow = new MessageActionRow().addComponents([
        new MessageSelectMenu()
          .setCustomId('settings_configType')
          .setPlaceholder('Select the type of settings you want to change.')
          .addOptions([
            {
              label: 'Personal Settings',
              value: 'personal',
              description: 'Your (per-guild) Personal Settings.',
            },
            {
              label: 'Guild Settings',
              value: 'guild',
              description: "The Server's Settings. (Requires 'Manage Server' Permissions).",
            },
          ]),
      ]);
      const ButtonRow = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('settings_exit').setStyle('DANGER').setLabel('Exit'),
      );
      return await interaction.editReply({
        content: 'Please select the type of settings you want to view / update.',
        components: [selectMenuRow, ButtonRow],
      });
      // OLD CODE BELOW:
      // const { client } = interaction;
      // const guildMembers = await interaction.guild.members;
      // try {
      //   const config = new ConfigFile('personal', interaction.guild);
      //   const settingCategory = interaction.options.getSubcommandGroup(true);
      //   if (settingCategory === 'get' && interaction.options.getSubcommand(true) === 'all') {
      //     const allSettings = new MessageEmbed()
      //       .setTitle('All of the settings')
      //       .setColor('RANDOM')
      //       .setDescription("Every setting under this server's config file.")
      //       .setTimestamp()
      //       .addFields({
      //         name: 'Config',
      //         value: `\`\`\` ${config.toString()} \`\`\``,
      //       });
      //     return await interaction.editReply({
      //       embeds: [allSettings],
      //     });
      //   }
      //   if (interaction.options.getSubcommand(true) === 'get') {
      //     const settingName = interaction.options.getString('setting_name');
      //     const settingValue = config.getSetting(settingName, settingCategory);
      //     return await interaction.editReply({
      //       content: `The setting \`${settingName}\` has the value of \` ${settingValue} \`.`,
      //     });
      //   }
      //   if (interaction.options.getSubcommand(true) === 'update') {
      //     const settingName = interaction.options.getString('setting_name');
      //     const settingValue = config.getSetting(settingName, settingCategory);
      //     let updatedValue = undefined;
      //     try {
      //       updatedValue = interaction.options.getBoolean('updated_value');
      //     } catch (err) {
      //       updatedValue = interaction.options.getString('updated_value');
      //     }
      //     try {
      //       config.updateSetting(settingName, settingCategory, updatedValue);
      //       return await interaction.editReply({
      //         content: `The setting \`${settingName}\`, which had the value of \` ${settingValue} \`, now has the value of \` ${updatedValue} \`.`,
      //       });
      //     } catch (err) {
      //       const errObject = new ErrorHandler(err, 'config-update');
      //       if (errObject.shouldExit) {
      //         return await interaction.editReply({
      //           content: errObject.message,
      //           ephemeral: true, // Always Ephemeral because it's an Error Reply.
      //         });
      //       } else console.log(errObject.message);
      //     }
      //   }
      // } catch (err) {
      //   const errObject = new ErrorHandler(err, 'config-get');
      //   if (errObject.shouldExit) {
      //     return await interaction.editReply({
      //       content: errObject.message,
      //       ephemeral: true, // Always Ephemeral because it's an Error Reply.
      //     });
      //   } else console.log(errObject.message);
      // }
    } catch (err) {
      const errObject = new ErrorHandler(err, 'config');
      if (errObject.code !== 'Unhandled') {
        console.log(
          `End of code catch triggered:\nMessage: ${errObject.message}\nCode: ${errObject.code}`,
        );
      } else {
        console.log(err);
        console.log(`Unhandled end of code catch triggered:\n${errObject.message}`);
      }
    }
  },
};
