import { Guild, User } from 'discord.js';
import * as fs from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { ConfigErrorHandler } from './ConfigErrorHandler.js';

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

export class Config {
  /**
   * ConfigHandler Constructor
   * @constructor
   * @param {String} configType - The type of config (Personal / Guild) that the instance is referring to.
   * @param {Guild | User} UIDObject - The interaction's current user's / guild's Object.
   *
   */
  public UIDObject: Guild | User;
  private id: string;
  private settings: JSON;
  constructor(UIDObject: Guild | User) {
    this.UIDObject = UIDObject;
    if (UIDObject instanceof Guild) {
      this.id = UIDObject.id;
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingParameters',
        );
      }
      try {
        const settings = JSON.parse(fs.readFileSync(`./configs/${this.id}_config.json`).toString());
        this.settings = settings;
      } catch (err) {
        if (err.code === `ENOENT`) {
          console.log(`The guild config for ${this.id} is missing. Creating...`);
          const settings = this.createMissingConfigFile();
          this.settings = settings;
        }
      }
      console.log('------------\nGuild Config instance successfully created.\n------------');
    } else if (UIDObject instanceof User) {
      this.id = UIDObject.id;
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingParameters',
        );
      }
      try {
        const settings = JSON.parse(
          fs.readFileSync(`./configs/personal_configs/${this.id}_config.json`).toString(),
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
        'The Constructor was called without either a Guild or a User Object.',
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
   *
   * @returns {JSON} The default settings in an Object form.
   */

  private createMissingConfigFile(): JSON {
    if (this.UIDObject instanceof Guild) {
      const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`).toString());
      fs.writeFileSync(
        `./configs/${this.id}_config.json`,
        stringify(defaultSettings, { maxLength: 0 }),
      );
      return defaultSettings;
    } else if (this.UIDObject instanceof User) {
      const defaultSettings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/default.json`).toString(),
      );
      fs.writeFileSync(
        `./configs/personal_configs/${this.id}_config.json`,
        stringify(defaultSettings, { maxLength: 0 }),
      );
      return defaultSettings;
    } else {
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingParameters',
      );
    }
  }

  /**
   * updateGuildInfo():
   * Used to update the Guild's Info section in the config
   * with the guild's current information.
   */
  async updateGuildInfo() {
    if (this.UIDObject instanceof User) return;
    const members = await this.UIDObject.members.fetch();
    const administrators = members.filter((member) => member.permissions.has('Administrator'));
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

  private refreshConfigFile() {
    if (this.UIDObject instanceof Guild) {
      const settings = JSON.parse(fs.readFileSync(`./configs/${this.id}_config.json`).toString());
      this.settings = settings;
    } else if (this.UIDObject instanceof User) {
      const settings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/${this.id}_config.json`).toString(),
      );
      this.settings = settings;
    } else {
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingParameters',
      );
    }
  }

  /**
   * updateSettings(): Used to update the settings within the guild's config.
   *
   * @param {String} [settingName] The setting's name.
   * @param {String} [settingCategory] The category the setting's under.
   * @param {String | Boolean} [updatedValue] The updated value.
   */

  public updateSetting(
    settingName: string,
    settingCategory: string,
    updatedValue: string | boolean | number,
  ) {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      if (this.settings[settingCategory][settingName] !== updatedValue) {
        this.settings[settingCategory][settingName] = updatedValue;
        if (this.UIDObject instanceof Guild) {
          fs.writeFileSync(
            `./configs/${this.id}_config.json`,
            stringify(this.settings, { maxLength: 0 }),
          );
        } else if (this.UIDObject instanceof User) {
          fs.writeFileSync(
            `./configs/personal_configs/${this.id}_config.json`,
            stringify(this.settings, { maxLength: 0 }),
          );
        } else {
          throw new ConfigErrorHandler(
            'this.UIDObject is neither a Guild or a User.',
            'MissingParameters',
          );
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

  public getSetting(settingName: string, settingCategory: string): string | boolean | number {
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

  public doesSettingExist(settingName: string, settingCategory: string): boolean {
    this.refreshConfigFile();
    return this.settings[settingCategory][settingName] !== undefined;
  }

  public toString(): string {
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
