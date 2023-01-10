import { GuildMember } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';

export const name = 'guildMemberAdd';
export async function execute(guildMember: GuildMember) {
  try {
    const { guild } = guildMember;
    const config = new Config(guild);
    console.log(`${guildMember.user.tag} has left the '${guildMember.guild.name}' server 😥`);
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
}
