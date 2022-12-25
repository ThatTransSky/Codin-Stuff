const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  name: 'messageUpdate',
  async execute(rawOldMsg, rawNewMsg) {
    try {
      const guild = rawOldMsg.guild;
      const config = new ConfigFile(guild.id);
      const logChannelID = config.getSetting(`logChannelID`, 'general');
      try {
        const msgChannel = await guild.channels.fetch(logChannelID, { force: true });
        const oldMsg = rawOldMsg.content;
        const newMsg = rawNewMsg.content;
        if (oldMsg !== newMsg) {
          const logUpdatedMessage = new MessageEmbed()
            .setColor(0xc46090)
            .setDescription(`A message was edited.`)
            .setTitle(`Logger`)
            .addFields(
              { name: `Original Message`, value: oldMsg },
              { name: `Updated Message`, value: newMsg },
            )
            .setTimestamp();
          return await msgChannel.send({
            embeds: [logUpdatedMessage],
          });
        } else {
          console.log(`messageUpdate event triggered without recorded changes.`);
          console.log(`Old message:\n${oldMsg}`);
          console.log(`New message:\n${newMsg}`);
          return;
        }
      } catch (err) {
        const errObject = new ErrorHandler(err, 'log');
        if (errObject.shouldExit) {
          console.log(`${logChannelID} was not found within ${guild.name} (id: ${guild.id})`);
          return;
        }
      }
    } catch (err) {
      const errObject = new ErrorHandler(err, 'log');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
