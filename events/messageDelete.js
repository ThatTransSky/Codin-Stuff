const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  name: 'messageDelete',
  async execute(rawDeletedMessage) {
    const guild = rawDeletedMessage.guild;
    const logChannelID = new ConfigFile(guild.id).getSetting('logChannelID', 'general');
    try {
      const loggingChannel = await guild.channels.fetch(logChannelID, { force: true });
      const deletedMessage = `\`\`\` ${rawDeletedMessage.content} \`\`\``;
      const logDeletedMessage = new MessageEmbed()
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
  },
};
