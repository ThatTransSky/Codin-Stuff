const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  name: 'guildMemberAdd',
  async execute(guildMember) {
    try {
      const config = new ConfigFile('guild', guildMember.guild);
      const { guild } = guildMember;
      console.log(`${guildMember.user.tag} has joined the '${guildMember.guild.name}' server! 🥳`);
      config.updateSetting('member_count', 'guild_info', guild.memberCount);
      console.log(
        `Member count successfully updated. Now at ${config.getSetting(
          'member_count',
          'guild_info',
        )}`,
      );
    } catch (err) {
      const errObject = new ErrorHandler(err, 'event');
      console.log(errObject.message);
    }
  },
};
