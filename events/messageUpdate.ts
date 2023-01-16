import { ChannelType, EmbedBuilder, Message } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';

export const name = 'messageUpdate';
export async function execute(rawOldMsg: Message, rawNewMsg: Message) {
  try {
    const guild = rawOldMsg.guild;
    const config = new Config(guild);
    const logChannelID = config.getSetting(`logChannelID`);
    const loggingChannel = await guild.channels.fetch(logChannelID as string, {
      force: true,
    });
    try {
      const oldMsg = rawOldMsg.content;
      const newMsg = rawNewMsg.content;
      if ((rawOldMsg.author.id || rawNewMsg.author.id) !== process.env.CLIENT_ID) {
        if (oldMsg !== newMsg) {
          const logUpdatedMessage = new EmbedBuilder()
            .setColor(0xc46090)
            .setDescription(`A message was edited.`)
            .setTitle(`Logger`)
            .addFields(
              {
                name: `Original Message`,
                value: `\`${oldMsg}\``,
              },
              {
                name: `Updated Message`,
                value: `\`${newMsg}\``,
              },
              {
                name: 'Channel',
                value: `<#${rawNewMsg.channel.id}>`,
              },
            )
            .setTimestamp();
          if (loggingChannel.type !== ChannelType.GuildText) return;
          return await loggingChannel.send({
            embeds: [logUpdatedMessage],
          });
        }
      } else {
        console.log(`messageUpdate event triggered without recorded changes.`);
        console.log(`Old message:\n${oldMsg}`);
        console.log(`New message:\n${newMsg}`);
        return;
      }
    } catch (err) {
      const errObject = new ErrorHandler(err, 'log');
      if (errObject.shouldExit) {
        if (errObject.message === '')
          console.log(`${logChannelID} was not found within ${guild.name} (id: ${guild.id})`);
        return;
      } else console.log(err);
    }
  } catch (err) {
    const errObject = new ErrorHandler(err, 'log');
    console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
  }
}
