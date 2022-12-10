const { MessageEmbed } = require('discord.js');
const ConfigFile = require('../handlers/ConfigHandler');

module.exports = {
  name: 'messageUpdate',
  async execute(rawOldMsg, rawNewMsg) {
    try {
      const guild = rawOldMsg.guild;
      const config = new ConfigFile(guild.id);
      const logChannelID = config.getSetting(`logChannelID`);
      try {
        const msgChannel = await guild.channels.resolve(logChannelID);
        // console.log(msgChannel);
        const oldMsg = rawOldMsg.content;
        const newMsg = rawNewMsg.content;
        if (!(oldMsg == newMsg)) {
          const logUpdatedMessage = new MessageEmbed()
            .setColor(0xc46090)
            .setDescription(`Can't be bothered`)
            .setTitle(`Logger`)
            .addFields(
              { name: `Original Message`, value: oldMsg },
              { name: `Updated Message`, value: newMsg },
            )
            .setTimestamp();
          return msgChannel.send({
            embeds: [logUpdatedMessage],
          });
        } else {
          console.log(`messageUpdate event triggered without recorded changes.`);
          console.log(`Old message:\n${oldMsg}`);
          console.log(`New message:\n${newMsg}`);
          return;
        }
      } catch (err) {
        if (err.status === 404) {
          return console.log(`${logChannelID} was not found within ${guild.name}`);
        }
        const guildOwner = await guild.fetchOwner();
        guildOwner
          .send({
            content: `The bot attempted to log a 'messageUpdate' event trigger but the 'logChannelID' setting is not configured. Please use /config-update in the respective server (Server_ID: ${guild.id}) to fix the issue. Thank you! <3`,
          })
          .catch((error) => {
            return console.log(
              "Failed to notify the owner. Possibly has DM's disabled. Error Type: " +
                error.message,
            );
          });
      }
    } catch (err) {
      if (err.type === 'InvalidGuildID') {
        console.error(`Invalid Guild ID: ${err.message}`);
      } else {
        console.error(err);
      }
    }
  },
};
