const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "bulk-ban"
Command Purpose: Bans a bulk of people under the same reason (if provided).
Command Options (if any): 
- Users (String Option, Required)
- Reason (String Option, default: "No reason specified")
- DaysToDeleteMessages (Number Option, default: 0)
Required Permissions: BAN_MEMBERS (1 << 2)
Checks (if any): 
- Is the specified user not the same as the triggering user?
- Is the specified user not the same as the bot?
- Is the specified amount of days higher than the limit (7)?
- Is the specified user not higher in roles then the triggering user?
- Is the specified user not higher in roles than the bot?
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('bulk-ban') // Sets the name.
    .setDescription('Bans the specified users, under the same reason.') // Sets the description.
    .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
    .addStringOption((option) => {
      return option
        .setName('users')
        .setDescription('Users to ban. Accepts user IDs, seperated by commas.')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('reason')
        .setDescription(
          'The reason for the bans. All users specified will be banned under this reason.',
        );
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
      let reason = interaction.options.getString('reason', false);
      const guildBans = interaction.guild.bans;
      if (reason == null) {
        reason = 'No reason provided.'; // If the reason was empty, replace it with "No reason provided."
      }
      let successfulBans = [];
      let unseccessfulBans = ``;
      for (const user of userIDs) {
        try {
          await guildBans.create(user, {
            reason: reason,
          });
        } catch (err) {
          const errObject = new ErrorHandler(err.message, err.code, 'bulk_ban');
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
            unseccessfulBans += `User ID \` ${user} \` has caused this error:\` ${errObject.message} (code: ${errObject.code}) \`\n`;
            continue;
          }
        }
        successfulBans += `\` ${user} \`\n`;
        console.log(
          `----------
          The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully banned user ID: ${user} from ${interaction.guild.name} (id: ${interaction.guild.id}).
          ----------`,
        );
      }
      if (successfulBans.length === 0) successfulBans = 'No successful bans on record.';
      if (unseccessfulBans.length === 0) unseccessfulBans = 'No unsuccessful bans on record.';
      const resultEmbed = new MessageEmbed()
        .setTitle('Bulk Ban Result')
        .setColor('RANDOM')
        .setDescription('The results of the bulk ban command.')
        .setTimestamp()
        .addFields(
          {
            name: 'Successful Bans',
            value: successfulBans,
            inline: false,
          },
          {
            name: 'Unsuccessful Bans',
            value: unseccessfulBans,
            inline: false,
          },
        );
      return await interaction.editReply({
        embeds: [resultEmbed],
        ephemeral: true,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'bulk_ban');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
