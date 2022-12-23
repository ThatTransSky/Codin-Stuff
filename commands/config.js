const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "config"
Command Purpose: Reads the Config file for the current guild and updates a given setting with the specified value.
Command Options (if any): 
- setting_name, Required String Option
- updated_value, String Option
Required Permissions: MANAGE_GUILD (1 << 5)
Checks (if any): 
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('config') // Sets the name
    .setDescription(
      'Reads the Config file for the current guild and updates a given setting with the specified value.',
    ) // Sets the description
    .setDefaultMemberPermissions(1 << 5) // Sets the required permissions (MANAGE_GUILD)
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName('ephemeral')
        .setDescription('The Ephemeral settings of the server.')
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName('update')
            .setDescription("Update whether the result of an action should be Ephemeral'd.")
            .addStringOption((option) => {
              return option
                .setName('setting_name')
                .setDescription('The action that you want to update.')
                .addChoices(
                  {
                    name: '/ban',
                    value: 'ban',
                  },
                  {
                    name: '/kick',
                    value: 'kick',
                  },
                  {
                    name: '/clear',
                    value: 'clear',
                  },
                  {
                    name: '/timeout',
                    value: 'timeout',
                  },
                )
                .setRequired(true);
            })
            .addBooleanOption((option) => {
              return option
                .setName('updated_value')
                .setDescription(`The action's updated value.`)
                .setRequired(true);
            }),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName('get')
            .setDescription(`Show's whether a specified action's result is Ephemeral'd.`)
            .addStringOption((option) => {
              return option
                .setName('setting_name')
                .setDescription('The action that you want to view.')
                .addChoices(
                  {
                    name: 'Are /ban results ephemeral?',
                    value: 'ban',
                  },
                  {
                    name: 'Are /kick results Ephemeral?',
                    value: 'kick',
                  },
                  {
                    name: 'Are /clear results ephemeral?',
                    value: 'clear',
                  },
                  {
                    name: 'Are /timeout results ephemeral?',
                    value: 'timeout',
                  },
                )
                .setRequired(true);
            }),
        ),
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName('general')
        .setDescription('The General settings of the server.')
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName('update')
            .setDescription("Update a setting's value.")
            .addStringOption((option) => {
              return option
                .setName('setting_name')
                .setDescription('The Name of the Setting that you want to update.')
                .addChoices({
                  name: "Logger's Channel ID",
                  value: 'logChannelID',
                })
                .setRequired(true);
            })
            .addStringOption((option) => {
              return option
                .setName('updated_value')
                .setDescription(`The setting's updated value.`)
                .setRequired(true);
            }),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName('get')
            .setDescription(`Show's the setting's current value.`)
            .addStringOption((option) => {
              return option
                .setName('setting_name')
                .setDescription('The Name of the Setting that you want to view.')
                .addChoices({
                  name: "Logger's Channel ID",
                  value: 'logChannelID',
                })
                .setRequired(true);
            }),
        ),
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName('get')
        .setDescription('get')
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName('all')
            .setDescription("Show's all of the settings under this server's config file."),
        ),
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      try {
        const config = new ConfigFile(interaction.guildId);
        const settingCategory = interaction.options.getSubcommandGroup(true);
        if (settingCategory === 'get' && interaction.options.getSubcommand(true) === 'all') {
          const allSettings = new MessageEmbed()
            .setTitle('All of the settings')
            .setColor('RANDOM')
            .setDescription("Every setting under this server's config file.")
            .setTimestamp()
            .addFields({
              name: 'Config',
              value: `\`\`\` ${config.toString()} \`\`\``,
            });
          return await interaction.editReply({
            embeds: [allSettings],
          });
        }
        if (interaction.options.getSubcommand() === 'get') {
          const settingName = interaction.options.getString('setting_name');
          const settingValue = config.getSetting(settingName, settingCategory);
          return await interaction.editReply({
            content: `The setting \`${settingName}\` has the value of \` ${settingValue} \`.`,
          });
        }
        if (interaction.options.getSubcommand() === 'update') {
          const settingName = interaction.options.getString('setting_name');
          const settingValue = config.getSetting(settingName, settingCategory);
          let updatedValue = undefined;
          try {
            updatedValue = interaction.options.getBoolean('updated_value');
          } catch (err) {
            updatedValue = interaction.options.getString('updated_value');
          }
          try {
            config.updateSetting(settingName, settingCategory, updatedValue);
            return await interaction.editReply({
              content: `The setting \`${settingName}\`, which had the value of \` ${settingValue} \`, now has the value of \` ${updatedValue} \`.`,
              epheremal: true,
            });
          } catch (err) {
            const errObject = new ErrorHandler(err, 'config-update');
            if (errObject.shouldExit) {
              return await interaction.editReply({
                content: errObject.message,
                ephemeral: true,
              });
            } else console.log(errObject.message);
          }
        }
      } catch (err) {
        const errObject = new ErrorHandler(err, 'config-get');
        if (errObject.shouldExit) {
          return await interaction.editReply({
            content: errObject.message,
            ephemeral: true,
          });
        } else console.log(errObject.message);
      }
    } catch (err) {
      const errObject = new ErrorHandler(err, 'config');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
