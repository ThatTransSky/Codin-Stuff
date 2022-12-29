const { Guild, User } = require('discord.js');
const fs = require(`fs`);
const stringify = require('json-stringify-pretty-compact');
const ConfigErrorHandler = require('./ConfigErrorHandler');

/**
 * ConfigHandler (I FUCKING DID IT WOOOOOO):
 * Creates a Config Class to allow for the reading and
 * writing of a predefined settings file.
 *
 *
 * @property {Guild | User} [UIDObject] - The Object of either a guild or a user.
 * @property {Snowflake} [id] - The ID of said Object.
 * @property {Object} [settings] - The contents of the config file in an Object form.
 * @property {String} [configType] - Whether the config is of a guild's or a user's.
 *
 */

class ConfigFile extends ConfigErrorHandler {
  /**
   * ConfigHandler Constructor
   * @constructor
   * @param {String} [configType] - The type of config (Personal / Guild) that the instance is referring to.
   * @param {Guild | User} [UIDObject] - The interaction's current user's / guild's Object.
   *
   */
  constructor(configType, UIDObject) {
    super();
    this.configType = configType.toLowerCase();
    this.UIDObject = UIDObject;
    this.id = this.UIDObject.id;
    if (this.configType === 'guild') {
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingParameters',
        );
      }
      try {
        const settings = JSON.parse(fs.readFileSync(`./configs/${this.id}_config.json`));
        this.settings = settings;
      } catch (err) {
        if (err.code === `ENOENT`) {
          console.log(`The guild config for ${this.id} is missing. Creating...`);
          const settings = this.createMissingConfigFile();
          this.settings = settings;
        }
      }
      console.log('------------\nGuild Config instance successfully created.\n------------');
    } else if (this.configType === 'personal') {
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingParameters',
        );
      }
      try {
        const settings = JSON.parse(
          fs.readFileSync(`./configs/personal_configs/${this.id}_config.json`),
        );
        this.settings = settings;
      } catch (err) {
        if (err.code === `ENOENT`) {
          console.log(`The user config for ${this.id} is missing. Creating...`);
          const settings = this.createMissingConfigFile();
          this.settings = settings;
        }
      }
      console.log('------------\nPersonal Config instance successfully created.\n------------');
    } else {
      throw new ConfigErrorHandler(
        'The Constructor was called without a configType.',
        'MissingParameters',
      );
    }
  }

  /**
   *
   * createMissingConfigFile Method:
   * Creates a config file for using provided guild ID using the default config.
   *
   * @private
   * @param {String} [ID] The guild ID to make a config for.
   *
   * @returns {Object} The default settings in an Object form.
   */

  createMissingConfigFile() {
    if (this.configType === 'guild') {
      const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`));
      fs.writeFileSync(
        `./configs/${this.id}_config.json`,
        stringify(defaultSettings, { maxLength: 0, alignKeys: true }),
      );
      return defaultSettings;
    } else if (this.configType === 'personal') {
      const defaultSettings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/default.json`),
      );
      fs.writeFileSync(
        `./configs/personal_configs/${this.id}_config.json`,
        stringify(defaultSettings, { maxLength: 0, alignKeys: true }),
      );
      return defaultSettings;
    } else {
      throw new ConfigErrorHandler('this.configType is missing a value.', 'MissingParameters');
    }
  }

  /**
   * updateGuildInfo():
   * Used to update the Guild's Info section in the config
   * with the guild's current information.
   *
   * @param {Guild} [guild] The Guild Object that we're taking information out of.
   *
   *
   */
  async updateGuildInfo() {
    const members = await this.UIDObject.members.fetch();
    const administrators = members.filter((member) => member.permissions.has('ADMINISTRATOR'));
    let administratorsObject = [];
    let count = 0;
    administrators.forEach((administrator) => {
      administratorsObject[count] = {
        username: administrator.user.tag,
        display_name: administrator.displayName,
        id: administrator.id,
        isBot: administrator.user.bot,
      };
      count++;
    });
    this.settings['guild_info'] = {
      ...this.settings['guild_info'],
      name: this.UIDObject.name,
      id: this.UIDObject.id,
      owner_id: this.UIDObject.ownerId,
      member_count: this.UIDObject.memberCount,
    };

    for (let i = 0; i < administratorsObject.length; i++) {
      this.settings['guild_info']['administrators'][i] = administratorsObject[i];
    }
    fs.writeFileSync(
      `./configs/${this.id}_config.json`,
      stringify(this.settings, {
        maxLength: 0,
        alignKeys: true,
      }),
    );
  }

  /**
   * refreshConfigFile():
   * Used to refresh the guild's config file to make sure it's up to date
   * before interacting with it.
   *
   * @private
   *
   */

  refreshConfigFile() {
    if (this.configType === 'guild') {
      const settings = JSON.parse(fs.readFileSync(`./configs/${this.ID}_config.json`));
      this.settings = settings;
    } else if (this.configType === 'personal') {
      const settings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/${this.ID}_config.json`),
      );
      this.settings = settings;
    } else {
      throw new ConfigErrorHandler('this.configType is missing a value.', 'MissingParameters');
    }
  }

  /**
   * updateSettings(): Used to update the settings within the guild's config.
   *
   * @param {String} [settingName] The setting's name.
   * @param {String} [settingCategory] The category the setting's under.
   * @param {String | Boolean} [updatedValue] The updated value.
   */

  updateSetting(settingName, settingCategory, updatedValue) {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      if (this.settings[settingCategory][settingName] !== updatedValue) {
        this.settings[settingCategory][settingName] = updatedValue;
        if (this.configType === 'guild') {
          fs.writeFileSync(
            `./configs/${this.ID}_config.json`,
            stringify(this.settings, { maxLength: 0, alignKeys: true }),
          );
        } else if (this.configType === 'personal') {
          fs.writeFileSync(
            `./configs/personal_configs/${this.ID}_config.json`,
            stringify(this.settings, { maxLength: 0, alignKeys: true }),
          );
        } else {
          throw new ConfigErrorHandler('this.configType is missing a value.', 'MissingParameters');
        }
        console.log(`The setting ${settingName} was accessed and updated to ${updatedValue}.`);
      } else {
        throw new ConfigErrorHandler(
          'The updated value is identical to the current value.',
          'NoChangesMade',
        );
      }
    } else
      throw new ConfigErrorHandler('The specified setting does not exist.', 'InvalidSettingName');
  }

  /**
   * getSetting(): Returns the provided setting's value.
   *
   * @param {String} [settingName] The setting's name that you're looking for.
   * @param {String} [settingCategory] The setting's category that it's under.
   *
   * @returns {String | Boolean} The setting's current value.
   */

  getSetting(settingName, settingCategory) {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      console.log(`The setting ${settingName} was accessed.`);
      return this.settings[settingCategory][settingName];
    } else {
      throw new ConfigErrorHandler(
        `The specified setting or category does not exist. Got ${settingName} under ${settingCategory}.`,
        'InvalidSettingNameOrCategory',
      );
    }
  }

  /**
   * doesSettingExist(): Checks whether a provided setting exists.
   * Pretty useless for the end user but good for debugging my stupid mistakes :>
   *
   * @param {String} [settingName] The setting's name.
   * @param {String} [settingCategory] The category that the setting is supposed to be under
   * @return {Boolean} Whether the setting exists or not.
   */

  doesSettingExist(settingName, settingCategory) {
    this.refreshConfigFile();
    return this.settings[settingCategory][settingName] !== undefined;
  }

  toString() {
    this.refreshConfigFile();
    let str = '';
    for (const key in this.settings) {
      str += `${key}:\n`;
      for (const innerKey in this.settings[key]) {
        str += `  ${innerKey}: ${this.settings[key][innerKey]}\n`;
      }
    }
    return str;
  }
}

module.exports = ConfigFile;
