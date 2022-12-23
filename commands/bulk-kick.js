const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bulk-kick')
    .setDescription('Bulk kick members.')
    .setDefaultMemberPermissions(1 << 1)
    .addStringOption((option) => {
      return option
        .setName('users')
        .setDescription('Users to kick. Accepts user IDs, seperated by commas.')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('reason')
        .setDescription(
          'The reason for the kicks. All users specified will be kicked under this reason.',
        );
    }),
  async execute(interaction) {
    try {
      const isEphemeral = new ConfigFile(interaction.guildID).getSetting('kick', 'ephemeral');
      await interaction.deferReply({
        ephemeral: isEphemeral,
      });
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      let userIDs = interaction.options.getString('users');
      userIDs = userIDs.split(',').map((s) => s.trim());
      let reason = interaction.options.getString('reason', false);
      if (reason == null) reason = 'No reason provided.';
      let successfulKicks = [];
      let unsuccessfulKicks = ``;
      for (const user of userIDs) {
        try {
          const guildMember = await guildMembers.fetch(user);
          await guildMember.kick(reason);
        } catch (err) {
          console.log(err.message);
          const errObject = new ErrorHandler(err, 'bulk_kick');
          if (errObject.shouldExit) {
            if (errObject.message.includes('Invalid Request Form.'))
              return await interaction.editReply({
                content:
                  'One (or more) of the user IDs provided are in an invalid format (most likely containing anything other than numbers).',
                ephemeral: true, // Always ephemeral since it's an Error reply.
              });
            return await interaction.editReply({
              content: errObject.message,
              ephemeral: true, // Always ephemeral since it's an Error reply.
            });
          } else {
            console.log(
              `The user ID (${user}) has caused this non-fatal error: ${errObject.message}`,
            );
            unsuccessfulKicks += `User ID \` ${user} \` has caused this error:\` ${errObject.message} (code: ${errObject.code}) \`\n`;
            continue;
          }
        }
        successfulKicks += `\` ${user} \`\n`;
        console.log(
          `The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully kicked user ID: ${user} from ${interaction.guild.name} (id: ${interaction.guild.id}).\n`,
        );
      }
      if (successfulKicks.length === 0) successfulKicks = 'No successful kicks on record.';
      if (unsuccessfulKicks.length === 0) unsuccessfulKicks = 'No unsuccessful kicks on record.';
      const resultEmbed = new MessageEmbed()
        .setTimestamp()
        .setTitle('Bulk Kick Result')
        .setDescription('The results of the bulk kick command.')
        .setColor('RANDOM')
        .addFields(
          {
            name: 'Successful Kicks',
            value: successfulKicks,
            inline: false,
          },
          {
            name: 'Unsuccessful Kicks',
            value: unsuccessfulKicks,
            inline: false,
          },
        );
      return await interaction.editReply({
        embeds: [resultEmbed],
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'bulk_kick');
      console.log(`End of code catch triggered:
        Message: ${errObject.message}
        Code: ${errObject.code}`);
    }
  },
};
