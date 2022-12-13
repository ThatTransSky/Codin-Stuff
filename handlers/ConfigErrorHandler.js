/**
 * Known error types:
 * - InvalidGuildID: Thrown when the provided guildID is empty or not enumerated.
 * - InvalidSettingName: Thrown when the provided settingName is empty or otherwise doesn't exist.
 */
class ConfigErrorHandler extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ConfigErrorHandler';
    this.code = code;
  }
}

module.exports = ConfigErrorHandler;
