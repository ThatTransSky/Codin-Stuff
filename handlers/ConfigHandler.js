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
 * @property {String} [guildID]
 * @property {Object} [settings]
 */

class ConfigFile extends ConfigErrorHandler {
  constructor(guildID = '') {
    super();
    if (guildID === '') {
      throw new ConfigErrorHandler('The guildID is empty.', 'InvalidGuildID');
    }
    this.guildID = guildID;
    try {
      const settings = JSON.parse(fs.readFileSync(`./configs/${guildID}_config.json`));
      this.settings = {};
      for (const [settingName, value] of Object.entries(settings)) {
        this.settings[settingName] = value;
      }
    } catch (error) {
      if (error.code === `ENOENT`) {
        console.log(`The config for ${guildID} is missing. Creating...`);
        const settings = this.createMissingConfigFile(guildID);
        this.settings = {};
        for (const [settingName, value] of Object.entries(settings)) {
          this.settings[settingName] = value;
        }
      }
    }
    console.log('----\nConfig instance successfully created.\n----');
  }

  createMissingConfigFile(guildID = '') {
    const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`));
    fs.writeFileSync(`./configs/${guildID}_config.json`, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  //I don't really think this will have any actual use, considering
  //the Config Object gets remade every time.

  //Huh. Guess I was wrong :/
  refreshConfigFile() {
    const settings = JSON.parse(fs.readFileSync(`./configs/${this.guildID}_config.json`));

    this.settings = {};
    for (const [settingName, value] of Object.entries(settings)) {
      this.settings[settingName] = value;
    }
    return this.settings;
  }

  updateSetting(settingName = '', value = '') {
    this.settings = this.refreshConfigFile();
    if (this.isSettingExist(settingName)) {
      this.settings[settingName] = value;
      fs.writeFileSync(`./configs/${this.guildID}_config.json`, JSON.stringify(this.settings));
      console.log(`The setting ${settingName} was accessed and updated to ${value}.`);
    } else
      throw new ConfigErrorHandler('The specified setting does not exist.', 'InvalidSettingName');
  }

  getSetting(settingName = '') {
    this.settings = this.refreshConfigFile();
    // console.log(this.settings[settingName])
    if (this.isSettingExist(settingName)) {
      console.log(`The setting ${settingName} was accessed.`);
      return this.settings[settingName];
    } else {
      throw new ConfigErrorHandler(
        `The specified setting does not exist. Got ${settingName}`,
        'InvalidSettingName',
      );
    }
  }

  isSettingExist(settingName = '') {
    this.settings = this.refreshConfigFile();
    return this.settings[settingName] !== undefined;
  }

  toString() {
    this.settings = this.refreshConfigFile();
    let settingsStringified = ``;
    for (const [settingName, value] of Object.entries(this.settings)) {
      settingsStringified += `${settingName}=${value}`;
    }
    return settingsStringified;
  }
}

module.exports = ConfigFile;
