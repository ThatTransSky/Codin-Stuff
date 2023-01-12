import { Collection, Guild, User } from 'discord.js';
import * as fs from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { Setting } from '../classes/setting.js';
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
 *
 */

export class Config {
  public UIDObject: Guild | User;
  private id: string;
  private settings: Collection<string, Setting>;
  /**
   * ConfigHandler Constructor
   * @constructor
   * @param {Guild | User} UIDObject - The interaction's current user's / guild's Object.
   *
   */
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
        const settingsCollection = this.convertToCollection(settings);
        this.settings = settingsCollection;
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
        const settingsCollection = this.convertToCollection(settings);
        this.settings = settingsCollection;
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
   * @returns {Collection<string, Setting>} The default settings in a Collection.
   */

  private createMissingConfigFile(): Collection<string, Setting> {
    if (this.UIDObject instanceof Guild) {
      const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`).toString());
      const defaultSettingsCollection = this.convertToCollection(defaultSettings);
      fs.writeFileSync(
        `./configs/${this.id}_config.json`,
        stringify(defaultSettingsCollection, { maxLength: 0 }),
      );
      return defaultSettingsCollection;
    } else if (this.UIDObject instanceof User) {
      const defaultSettings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/default.json`).toString(),
      );
      const defaultSettingsCollection = this.convertToCollection(defaultSettings);
      fs.writeFileSync(
        `./configs/personal_configs/${this.id}_config.json`,
        stringify(defaultSettings, { maxLength: 0 }),
      );
      return defaultSettingsCollection;
    } else {
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingParameters',
      );
    }
  }

  private convertToCollection(settings: any[]): Collection<string, Setting> {
    let settingsCollection = new Collection<string, Setting>();
    settings.forEach((setting) => {
      console.log(`${setting.name}, ${setting.value}, ${setting.category}`);
      settingsCollection.set(setting.name as string, {
        name: setting.name as string,
        value: setting.value as string | number | boolean | any[],
        category: setting.category as string,
      });
    });
    console.log(settingsCollection);
    return settingsCollection;
  }
  /**
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
    this.settings.set('guild_name', {
      name: 'guild_name',
      value: this.UIDObject.name,
      category: 'info',
    });
    this.settings.set('guild_id', {
      name: 'guild_id',
      value: this.UIDObject.id,
      category: 'info',
    });
    this.settings.set('owner_id', {
      name: 'owner_id',
      value: this.UIDObject.ownerId,
      category: 'info',
    });
    this.settings.set('member_count', {
      name: 'member_count',
      value: this.UIDObject.memberCount,
      category: 'info',
    });
    this.settings.set('administrators', {
      name: 'administrators',
      value: administratorsObject,
      category: 'info',
    });
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
      const settingsCollection = this.convertToCollection(settings);
      this.settings = settingsCollection;
    } else if (this.UIDObject instanceof User) {
      const settings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/${this.id}_config.json`).toString(),
      );
      const settingsCollection = this.convertToCollection(settings);
      this.settings = settingsCollection;
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
   * @param {string} [settingName] The setting's name.
   * @param {string} [settingCategory] The category the setting's under.
   * @param {string | boolean} [updatedValue] The updated value.
   */

  public updateSetting(
    settingName: string,
    settingCategory: string,
    updatedValue: string | boolean | number,
  ) {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName, settingCategory)) {
      let mappedSettings = this.settings.mapValues((setting) => {
        if (setting.category === settingCategory) return setting;
      });
      console.log(mappedSettings);

      // console.log(`The setting ${settingName} was accessed and updated to ${updatedValue}.`);
      // } else {
      //   throw new ConfigErrorHandler(
      //     'The updated value is identical to the current value.',
      //     'NoChangesMade',
      //   );
      // }
    } else
      throw new ConfigErrorHandler('The specified setting does not exist.', 'InvalidSettingName');
  }

  /**
   * getSetting(): Returns the provided setting's value.
   *
   * @param {string} [settingName] The setting's name that you're looking for.
   * @param {string} [settingCategory] The setting's category that it's under.
   *
   * @returns {string | boolean} The setting's current value.
   */

  public getSetting(
    settingName: string,
    settingCategory: string,
  ): string | boolean | number | any[] {
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
   * @param {string} [settingName] The setting's name.
   * @param {string} [settingCategory] The category that the setting is supposed to be under
   * @return {boolean} Whether the setting exists or not.
   */

  public doesSettingExist(settingName: string, settingCategory: string): boolean {
    this.refreshConfigFile();
    return this.settings[settingCategory][settingName] !== undefined;
  }

  // public settingsToArray(settingCategory: string): any[] {
  //   this.refreshConfigFile();
  //   if (this.UIDObject instanceof Guild) {
  //   } else if (this.UIDObject instanceof User) {
  //   } else {
  //     throw new ConfigErrorHandler(
  //       'this.UIDObject is neither a Guild or a User.',
  //       'MissingParameters',
  //     );
  //   }
  // }

  public toCollection(): Collection<string, any> {
    this.refreshConfigFile();
    let collection = new Collection<string, any>();

    return collection;
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
