const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "bulk-unban"
Command Purpose: Removes a bulk of bans.
Command Options (if any): 
- Users (String Option, Required)
Required Permissions: BAN_MEMBERS (1 << 2)
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('bulk-unban') // Sets the name.
    .setDescription('Removes a bulks of bans.') // Sets the description.
    .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
    .addStringOption((option) => {
      return option
        .setName('users')
        .setDescription('Users to unban. Accepts user IDs, seperated by commas.')
        .setRequired(true);
    }),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Funnels the provided options into variables.
      let userIDs = interaction.options.getString('users');
      userIDs = userIDs.split(',').map((s) => s.trim());
      // Splits the string at the commas and removes any whitespaces.
      // Inputs the result into an array.
      const guildBans = interaction.guild.bans;
      let successfulUnbans = [];
      let unseccessfulUnbans = ``;
      for (const user of userIDs) {
        try {
          await guildBans.remove(user);
        } catch (err) {
          const errObject = new ErrorHandler(err.message, err.code, 'bulk_unban');
          if (errObject.shouldExit) {
            if (errObject.message.includes('Invalid Request Format.'))
              return await interaction.editReply({
                content:
                  'One (or more) of the user IDs provided are in an invalid format (most likely containing anything other than numbers).',
                ephemeral: true,
              });
            return await interaction.editReply({
              content: errObject.message,
              ephemeral: true,
            });
          } else {
            console.log(
              `The user ID (${user}) has caused this non-fatal error: ${errObject.message}`,
            );
            unseccessfulUnbans += `User ID \`${user}\` has caused this error: \` ${errObject.message} (code: ${errObject.code}) \`\n`;
            continue;
          }
        }
        successfulUnbans += `\` ${user} \`\n`;
        console.log(
          `----------
          The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully unbanned user ID: ${user} from ${interaction.guild.name} (id: ${interaction.guild.id}).
          ----------`,
        );
      }
      if (successfulUnbans.length === 0) successfulUnbans = 'No successful unbans on record.';
      if (unseccessfulUnbans.length === 0) unseccessfulUnbans = 'No unsuccessful unbans on record.';
      const resultEmbed = new MessageEmbed()
        .setTitle('Bulk Unban Result')
        .setColor('RANDOM')
        .setDescription('The results of the bulk unban command.')
        .setTimestamp()
        .addFields(
          {
            name: 'Successful Unbans',
            value: successfulUnbans,
            inline: false,
          },
          {
            name: 'Unsuccessful Unbans',
            value: unseccessfulUnbans,
            inline: false,
          },
        );
      return await interaction.editReply({
        embeds: [resultEmbed],
        ephemeral: true,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'bulk_unban');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
