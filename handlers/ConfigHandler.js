const fs = require(`fs`);
const ConfigErrorHandler = require('./ConfigErrorHandler');

/**
 * ConfigHandler (I FUCKING DID IT WOOOOOO):
 * Creates a Config Class to allow for the reading and
 * writing of a predefined settings file.
 *
 * TODO:
 * - Allow for the creation of the file (with pre-defined defaults)
 *   in case the file doesn't exists. DONE
 * - Extend that for other servers that are yet to have an
 *   existing Config file. (Format: serverID_config.json) AND DONE (I'm so amazing 🥰)
 *
 * @property {String} [ID] - The ID of either a guild or a user.
 * @property {Object} [settings] - The contents of the config file in an Object form.
 * @property {String} [configType] - Whether the config is of a guild's or a user's.
 *
 */

class ConfigFile extends ConfigErrorHandler {
  /**
   * ConfigHandler Constructor
   *
   * @param {String} [configType] - The type of config (Personal / Guild) that the instance is referring to.
   * @param {String} [ID] - The interaction's current guildID (used to look up the guild's config).
   *
   */
  constructor(configType, ID) {
    super();
    this.configType = configType;
    this.ID = ID;
    if (this.configType === 'guild') {
      if (ID === '' || ID === undefined) {
        throw new ConfigErrorHandler(
          'The constructor was called without a GuildID.',
          'MissingParameters',
        );
      }
      try {
        const settings = JSON.parse(fs.readFileSync(`./configs/${ID}_config.json`));
        this.settings = settings;
      } catch (error) {
        if (error.code === `ENOENT`) {
          console.log(`The guild config for ${ID} is missing. Creating...`);
          const settings = this.createMissingConfigFile(ID);
          this.settings = settings;
        }
      }
      console.log('------------\nGuild Config instance successfully created.\n------------');
    } else if (this.configType === 'personal') {
      try {
        const settings = JSON.parse(
          fs.readFileSync(`./configs/personal_configs/${ID}_config.json`),
        );
      } catch (err) {}
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
   * @param {String} [ID] - The guild ID to make a config for.
   *
   * @returns {Object} The default settings in an Object form.
   */

  createMissingConfigFile() {
    if (this.configType === 'guild') {
      const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`));
      fs.writeFileSync(`./configs/${this.ID}_config.json`, JSON.stringify(defaultSettings));
      return defaultSettings;
    } else if (this.configType === 'personal') {
      const defaultSettings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/default.json`),
      );
      fs.writeFileSync(
        `./configs/personal_configs/${this.ID}_config.json`,
        JSON.stringify(defaultSettings),
      );
      return defaultSettings;
    } else {
      throw new ConfigErrorHandler('this.configType is missing a value.', 'MissingParameters');
    }
  }

  /**
   * refreshConfigFile():
   * Used to refresh the guild's config file to make sure it's up to date
   * before interacting with it.
   *
   * @private
   * @returns {Object} The guild's current settings in Object form.
   *
   */

  refreshConfigFile() {
    if (this.configType === 'guild') {
      const settings = JSON.parse(fs.readFileSync(`./configs/${this.ID}_config.json`));
      this.settings = settings;
      return this.settings;
    } else if (this.configType === 'personal') {
      const settings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/${this.ID}_config.json`),
      );
      this.settings = settings;
      return this.settings;
    } else {
      throw new ConfigErrorHandler('this.configType is missing a value.', 'MissingParameters');
    }
  }

  /**
   * updateSettings(): Used to update the settings within the guild's config.
   *
   * @param {String} [settingName] - The setting's name.
   * @param {String} [settingCategory] - The category the setting's under.
   * @param {String | Boolean} [updatedValue] - The updated value.
   */

  updateSetting(settingName, settingCategory, updatedValue) {
    this.settings = this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      if (this.settings[settingCategory][settingName] !== updatedValue) {
        this.settings[settingCategory][settingName] = updatedValue;
        if (this.configType === 'guild') {
          fs.writeFileSync(`./configs/${this.ID}_config.json`, JSON.stringify(this.settings));
        } else if (this.configType === 'personal') {
          fs.writeFileSync(
            `./configs/personal_configs/${this.ID}_config.json`,
            JSON.stringify(this.settings),
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
   * @param {String} [settingName] - The setting's name that you're looking for.
   * @param {String} [settingCategory] - The setting's category that it's under.
   *
   * @returns {String | Boolean} The setting's current value.
   */

  getSetting(settingName, settingCategory) {
    this.settings = this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      console.log(`The setting ${settingName} was accessed.`);
      return this.settings[settingCategory][settingName];
    } else {
      throw new ConfigErrorHandler(
        `The specified setting does not exist. Got ${settingName}`,
        'InvalidSettingName',
      );
    }
  }

  doesSettingExist(settingName, settingCategory) {
    this.settings = this.refreshConfigFile();
    return this.settings[settingCategory][settingName] !== undefined;
  }

  toString() {
    this.settings = this.refreshConfigFile();
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
