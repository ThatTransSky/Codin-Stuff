const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  name: 'messageUpdate',
  async execute(rawOldMsg, rawNewMsg) {
    try {
      const guild = rawOldMsg.guild;
      try {
        const oldMsg = rawOldMsg.content;
        const newMsg = rawNewMsg.content;
        if ((rawOldMsg.author.id || rawNewMsg.author.id) !== process.env.CLIENT_ID) {
          if (oldMsg !== newMsg) {
            const config = new ConfigFile('guild', guild);
            const logChannelID = config.getSetting(`logChannelID`, 'general');
            const loggingChannel = await guild.channels.fetch(logChannelID, { force: true });
            const logUpdatedMessage = new MessageEmbed()
              .setColor(0xc46090)
              .setDescription(`A message was edited.`)
              .setTitle(`Logger`)
              .addFields(
                { name: `Original Message`, value: oldMsg },
                { name: `Updated Message`, value: newMsg },
              )
              .setTimestamp();
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
  },
};
