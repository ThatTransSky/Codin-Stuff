import { DiscordAPIError } from 'discord.js';
import { ConfigErrorHandler } from './ConfigErrorHandler.js';

/**
 * ErrorHandler (Hand-made by Sky (that's me because I like pain 🥰)).
 *
 * All of the handling is within the constructor (because making it a seperate method seems pointless).
 * (Note to self: The ConfigErrorHandler I made passes the types as codes.)
 *
 *
 */
export class ErrorHandler {
  /**
   * ErrorHandler's Constructor.
   *
   * @param {DiscordAPIError | Error | ConfigErrorHandler} err The Error Object.
   * @param {String} action The Action that was attempted before error-ing.
   *
   */
  public message: string;
  public code: string | number;
  public stack: string;
  public action: string;
  public shouldExit?: boolean;
  constructor(err: DiscordAPIError | Error, action: string) {
    this.message = err.message;
    if (err instanceof DiscordAPIError) this.code = err.status;
    else if (err instanceof ConfigErrorHandler) this.code = err.code;
    else this.code = undefined;
    this.stack = err.stack;
    this.action = action;
    this.shouldExit = false;
    const singleModeration = ['ban', 'kick', 'timeout', 'unban', 'untimeout', 'check_timeout'];
    const bulkModeration = ['bulk_ban', 'bulk_unban', 'bulk_kick'];
    const anyModeration = singleModeration.concat(bulkModeration);
    const guildMemberRequired = ['kick', 'timeout', 'untimeout', 'check_timeout', 'bulk_kick'];
    const channelBasedActions = ['clear'];
    const messageBasedActions = ['clear', 'log', 'random_color'];
    const configRequiredActions = ['config', 'config-update', 'config-get', 'weather'];
    if (this.action === ('interaction' || 'event')) this.shouldExit = true;
    if (this.message === 'Unknown User') {
      this.code = this.message;
      this.message = 'User does not exist within the DiscordAPI.';
      if (singleModeration.includes(this.action)) this.shouldExit = true; // If the action was performed on a single user, exit.
      // Otherwise, continue.
      return;
    } else if (this.message === 'Unknown Member') {
      this.code = this.message;
      this.message = 'User does not exist within the current Guild.';
      if (guildMemberRequired.includes(this.action) && !bulkModeration.includes(this.action))
        this.shouldExit = true; // If the action requires a present guild member, exit.
      // Otherwise, continue.
      return;
    } else if (this.message === 'Missing Permissions') {
      this.code = this.message;
      this.message = `The user (or bot) does not have the required permissions to execute this action. (Action: ${this.action})`;
      if (!bulkModeration.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.message === 'Unknown Channel') {
      this.code = this.message;
      this.message = `The channel you were trying to reference is either unknown, 
      invalid, or not within the bot's (or the user's) scope of permissions.`;
      if (channelBasedActions.includes(this.action) || messageBasedActions.includes(this.action))
        this.shouldExit = true;
      return;
    } else if (this.message.includes('a member higher than you')) {
      this.code = this.message;
      this.message = `The bot tried to perform an action (${this.action}) on a user above them in permissions.`;
      if (singleModeration.includes(this.action) || guildMemberRequired.includes(this.action))
        this.shouldExit = true;
      return;
    } else if (this.message.includes('send messages to this user')) {
      this.code = this.message;
      this.message = 'The user you tried message does not allow private messages.';
      this.shouldExit = true;
      // ^Almost always, need to find an edge case where this should be false.
      return;
    } else if (this.message === 'Unknown Message') {
      this.code = this.message;
      if (this.action === 'clear')
        this.message =
          'The /clear command encountered a message that is older than 14 days. Try reducing the amount of messages.';
      else
        this.message = `The message you were trying to reference is either unknown,
    invalid, or inside of a channel that either you (or the bot) don't have access to.`;
      if (messageBasedActions.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.message === 'Unknown Ban') {
      this.code = this.message;
      this.message = 'The ban you were trying to reference was not found.';
      if (singleModeration.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.message.includes('Invalid Form Body')) {
      this.code = this.message;
      this.message = 'Invalid Request Format. Internal Error, notify creator.';
      this.shouldExit = true;
      return;
    } else if (this.code === 'InvalidSettingName') {
      if (configRequiredActions.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.code === 'InvalidGuildID') {
      // This should never execute unless the guild ID was purposefully invalid.
      this.message = 'The guild ID that was provided to the config was empty or invalid.';
      if (configRequiredActions.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.code === 'NoChangesMade') {
      if (configRequiredActions.includes(this.action)) this.shouldExit = true;
      return;
    } else if (this.code === 'MissingParameters') {
      if (configRequiredActions.includes(this.action)) this.shouldExit = true;
      return;
    }
    this.message = `A non-fatal (or otherwise unhandled) error has occurred.\n
  Message: ${this.message}\n
  Code: ${this.code}\n
  Action: ${this.action}\n
  Raw Error Data: ${err.stack || err}\n`;
    this.code = 'Unhandled';
    this.shouldExit = true;
    return;
  }
}
