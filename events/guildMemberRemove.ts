import { GuildMember } from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';

export const name = 'guildMemberAdd';
export async function execute(guildMember: GuildMember) {
  try {
    const { guild } = guildMember;
    const config = new Config(guild);
    console.log(`${guildMember.user.tag} has left the '${guildMember.guild.name}' server 😥`);
    await config.updateSetting('member_count', guild.memberCount as number);
    console.log(`Member count successfully updated. Now at ${config.getSetting('member_count')}`);
  } catch (err) {
    const errObject = new ErrorHandler(err, 'event');
    console.log(errObject.message);
  }
}
