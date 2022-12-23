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
 * @property {String} [guildID]
 * @property {Object} [settings]
 *
 */

class ConfigFile extends ConfigErrorHandler {
  /**
   * ConfigHandler Constructor
   *
   * @param {String} [guildID] - The interaction's current guildID (used to look up the guild's config)
   *
   */
  constructor(guildID = '') {
    super();
    if (guildID === '' || guildID === undefined) {
      throw new ConfigErrorHandler('The constructor was called without a GuildID.', 'EmptyGuildID');
    }
    this.guildID = guildID;
    try {
      const settings = JSON.parse(fs.readFileSync(`./configs/${guildID}_config.json`));
      this.settings = settings;
    } catch (error) {
      if (error.code === `ENOENT`) {
        console.log(`The config for ${guildID} is missing. Creating...`);
        const settings = this.createMissingConfigFile(guildID);
        this.settings = settings;
      }
    }
    console.log('------------\nConfig instance successfully created.\n------------');
  }

  /**
   *
   * createMissingConfigFile Method:
   * Creates a config file for using provided guild ID using the default config.
   *
   * @private
   * @param {String} [guildID] - The guild ID to make a config for.
   *
   * @returns {Object} The default settings in an Object form.
   */

  createMissingConfigFile(guildID) {
    const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`));
    fs.writeFileSync(`./configs/${guildID}_config.json`, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  /**
   * refreshConfigFile():
   * Used to refresh the guild's config file to make sure it's up to date
   * before interacting with it.
   *
   * @private
   * @returns {Object} The guild's current settings in Object form.
   */

  refreshConfigFile() {
    const settings = JSON.parse(fs.readFileSync(`./configs/${this.guildID}_config.json`));
    this.settings = settings;
    return this.settings;
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
        fs.writeFileSync(`./configs/${this.guildID}_config.json`, JSON.stringify(this.settings));
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
