import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
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
  });

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const config = new Config(interaction.guild);
    const isEphemeral = config.getSetting('kick', 'ephemeral');
    await interaction.deferReply({
      ephemeral: isEphemeral as boolean,
    });
    const client = interaction.client;
    const guildMembers = interaction.guild.members;
    const stringedUserIDs = interaction.options.getString('users');
    const userIDs = stringedUserIDs.split(',').map((s) => s.trim());
    let reason = interaction.options.getString('reason', false);
    if (reason == null) reason = 'No reason provided.';
    let successfulKicks: string[] = [];
    let unsuccessfulKicks: string[] = [];
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
            });
          return await interaction.editReply({
            content: errObject.message,
          });
        } else {
          console.log(
            `The user ID (${user}) has caused this non-fatal error: ${errObject.message}`,
          );
          unsuccessfulKicks.push(
            `User ID \` ${user} \` has caused this error:\` ${errObject.message} (code: ${errObject.code}) \`\n`,
          );
          continue;
        }
      }
      successfulKicks.push(`\` ${user} \`\n`);
      console.log(
        `The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully kicked user ID: ${user} from ${interaction.guild.name} (id: ${interaction.guild.id}).\n`,
      );
    }
    if (successfulKicks.length === 0) successfulKicks = ['No successful kicks on record.'];
    if (unsuccessfulKicks.length === 0) unsuccessfulKicks = ['No unsuccessful kicks on record.'];
    const resultEmbed = new EmbedBuilder()
      .setTimestamp()
      .setTitle('Bulk Kick Result')
      .setDescription('The results of the bulk kick command.')
      .setColor('Random')
      .addFields(
        {
          name: 'Successful Kicks',
          value: successfulKicks.toString().replace(',', ''),
          inline: false,
        },
        {
          name: 'Unsuccessful Kicks',
          value: unsuccessfulKicks.toString().replace(',', ''),
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
}
