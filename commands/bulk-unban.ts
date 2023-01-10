import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { ChatInputCommandInteraction } from 'discord.js';
/*
Command Name: "bulk-unban"
Command Purpose: Removes a bulk of bans.
Command Options (if any): 
- Users (String Option, Required)
Required Permissions: BAN_MEMBERS (1 << 2)
*/
export const data = new SlashCommandBuilder()
  .setName('bulk-unban') // Sets the name.
  .setDescription('Removes a bulks of bans.') // Sets the description.
  .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
  .addStringOption((option) => {
    return option
      .setName('users')
      .setDescription('Users to unban. Accepts user IDs, seperated by commas.')
      .setRequired(true);
  });

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const config = new Config(interaction.guild);
    const isEphemeral = config.getSetting('ban', 'ephemeral');
    await interaction.deferReply({
      ephemeral: isEphemeral as boolean,
    });
    // Necessary constants
    const client = interaction.client;
    const guildMembers = interaction.guild.members;
    // Funnels the provided options into variables.
    const stringedUserIDs = interaction.options.getString('users');
    const userIDs = stringedUserIDs.split(',').map((s) => s.trim());
    // Splits the string at the commas and removes any whitespaces.
    // Inputs the result into an array.
    const guildBans = interaction.guild.bans;
    let successfulUnbans: string[] = [];
    let unseccessfulUnbans: string[] = [];
    for (const user of userIDs) {
      try {
        await guildBans.remove(user);
      } catch (err) {
        const errObject = new ErrorHandler(err, 'bulk_unban');
        if (errObject.shouldExit) {
          if (errObject.message.includes('Invalid Request Format.'))
            return await interaction.editReply({
              content:
                'One (or more) of the user IDs provided are in an invalid format (most likely containing anything other than numbers).',
            });
          return await interaction.editReply({
            content: errObject.message,
          });
        } else {
          console.log(
            `The user ID (${user}) has caused this non-fatal error: ${errObject.message}`,
          );
          unseccessfulUnbans.push(
            `User ID \`${user}\` has caused this error: \` ${errObject.message} (code: ${errObject.code}) \`\n`,
          );
          continue;
        }
      }
      successfulUnbans.push(`\` ${user} \`\n`);
      console.log(
        `----------
          The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully unbanned user ID: ${user} from ${interaction.guild.name} (id: ${interaction.guild.id}).
          ----------`,
      );
    }
    if (successfulUnbans.length === 0) successfulUnbans = ['No successful unbans on record.'];
    if (unseccessfulUnbans.length === 0) unseccessfulUnbans = ['No unsuccessful unbans on record.'];
    const resultEmbed = new EmbedBuilder()
      .setTitle('Bulk Unban Result')
      .setColor('Random')
      .setDescription('The results of the bulk unban command.')
      .setTimestamp()
      .addFields(
        {
          name: 'Successful Unbans',
          value: successfulUnbans.toString().replace(',', ''),
        },
        {
          name: 'Unsuccessful Unbans',
          value: unseccessfulUnbans.toString().replace(',', ''),
        },
      );
    return await interaction.editReply({
      embeds: [resultEmbed],
    });
  } catch (err) {
    const errObject = new ErrorHandler(err, 'bulk_unban');
    console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
  }
}
