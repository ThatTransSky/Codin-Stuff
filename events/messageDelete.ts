import { ChannelType, EmbedBuilder, Message } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';

export const name = 'messageDelete';
export async function execute(rawDeletedMessage: Message) {
  try {
    const guild = rawDeletedMessage.guild;
    const config = new Config(guild);
    const logChannelID = config.getSetting('logChannelID', 'general');
    try {
      const loggingChannel = await guild.channels.fetch(logChannelID as string, { force: true });
      const deletedMessage = `\`\`\` ${rawDeletedMessage.content} \`\`\``;
      const logDeletedMessage = new EmbedBuilder()
        .setColor(0xc46090)
        .setDescription('A message was deleted.')
        .setTitle('Logger')
        .addFields(
          {
            name: 'Deleted Message',
            value: deletedMessage,
          },
          {
            name: 'Channel',
            value: `<#${rawDeletedMessage.channel.id}>`,
          },
        )
        .setTimestamp();
      if (loggingChannel.type !== ChannelType.GuildText) return;
      return await loggingChannel.send({
        embeds: [logDeletedMessage],
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'log');
      if (errObject.shouldExit && errObject.message === 'Unknown Channel') {
        console.log(`${logChannelID} was not found within ${guild.name} (id: ${guild.id})`);
        return;
      } else {
        console.log(err);
      }
    }
  } catch (err) {
    const errObject = new ErrorHandler(err, 'log');
    console.log(errObject.message);
  }
}
