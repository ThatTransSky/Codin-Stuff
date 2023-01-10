import { ChannelType, Message } from 'discord.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';

export const name = 'messageCreate';
export async function execute(msg: Message) {
  try {
    if (!msg) return;
    const msgChannel = msg.channel;
    const msgContent = msg.content;
    const author = msg.author;
    if (author.id !== process.env.CLIENT_ID) {
      if (msgChannel.type !== ChannelType.GuildText) return;
      console.log(
        `${author.username} (${author.id}) messaged "${msgContent}" in #${msgChannel.name}.`,
      );
    }
    return;
  } catch (err) {
    const errObject = new ErrorHandler(err, 'Event');
    console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
  }
}
