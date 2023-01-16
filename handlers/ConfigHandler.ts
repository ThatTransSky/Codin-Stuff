import { stripIndent } from 'common-tags';
import { APISelectMenuOption, Collection, Guild, User } from 'discord.js';
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
  private UIDObject: Guild | User;
  private id: string;
  private settings: Collection<string, Setting>;
  private defaultSettings: Collection<string, Setting>;
  /**
   * ConfigHandler Constructor
   * @constructor
   * @param {Guild | User} UIDObject - The interaction's current user's / guild's Object.
   *
   */
  constructor(UIDObject: Guild | User) {
    this.UIDObject = UIDObject;
    this.defaultSettings = this.getDefaultSettings();
    if (UIDObject instanceof Guild) {
      this.id = UIDObject.id;
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingOrInvalidParameters',
        );
      }
      try {
        const settings = JSON.parse(fs.readFileSync(`./configs/${this.id}_config.json`).toString());
        const settingsCollection = this.convertToCollection(settings);
        this.settings = settingsCollection;
      } catch (err) {
        if (err.code === `ENOENT`) {
          console.log(`The guild config for ${this.id} is missing. Creating...`);
          const settings = this.getDefaultSettings();
          fs.writeFileSync(
            `./configs/${this.id}_config.json`,
            stringify(settings, { maxLength: 0 }),
          );
          this.settings = settings;
        }
      }
      console.log('------------\nGuild Config instance successfully created.\n------------');
    } else if (UIDObject instanceof User) {
      this.id = UIDObject.id;
      if (this.id === ('' || undefined || null)) {
        throw new ConfigErrorHandler(
          'The constructor was called without an ID.',
          'MissingOrInvalidParameters',
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
          const settings = this.getDefaultSettings();
          fs.writeFileSync(
            `./configs/personal_configs/${this.id}_config.json`,
            stringify(settings, { maxLength: 0 }),
          );
          this.settings = settings;
        }
      }
      console.log('------------\nPersonal Config instance successfully created.\n------------');
    } else {
      throw new ConfigErrorHandler(
        'The Constructor was called without either a Guild or a User Object.',
        'MissingOrInvalidParameters',
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

  private getDefaultSettings(): Collection<string, Setting> {
    if (this.UIDObject instanceof Guild) {
      const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`).toString());
      return this.convertToCollection(defaultSettings);
    } else if (this.UIDObject instanceof User) {
      const defaultSettings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/default.json`).toString(),
      );
      return this.convertToCollection(defaultSettings);
    } else {
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingOrInvalidParameters',
      );
    }
  }

  private convertToCollection(settings: any[]): Collection<string, Setting> {
    let settingsCollection = new Collection<string, Setting>();
    settings.forEach((setting) => {
      // console.log(`${setting.name}, ${setting.value}, ${setting.category}`);
      settingsCollection.set(setting.name as string, {
        name: setting.name as string,
        value: setting.value as string | number | boolean | any[],
        type: setting.type as string,
        category: setting.category as string,
        description: setting.description,
      });
    });
    // console.log(settingsCollection);
    return settingsCollection;
  }

  /**
   * Used to update the Guild's Info section in the config
   * with the guild's current information.
   */
  public async updateGuildInfo() {
    this.refreshConfigFile();
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
    const guild_info = {
      guild_name: this.UIDObject.name,
      guild_id: this.UIDObject.id,
      owner_id: this.UIDObject.ownerId,
      member_count: this.UIDObject.memberCount,
      administrators: administratorsObject,
    };
    this.settings.forEach((setting) => {
      if (setting.category !== 'info') return;
      this.settings.set(setting.name, {
        name: setting.name,
        value: guild_info[`${setting.name}`],
        type: setting.type,
        category: setting.category,
        description: setting.description,
      });
    });
    fs.writeFileSync(
      `./configs/${this.id}_config.json`,
      stringify(this.settings, { maxLength: 0 }),
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
      this.defaultSettings = this.getDefaultSettings();
      if (this.validateAgainstDefault()) this.settings = settingsCollection;
      else {
        console.log(`Guild setting structure invalid, Resetting...`);
        this.settings = this.defaultSettings;
        fs.writeFileSync(
          `./configs/${this.id}_config.json`,
          stringify(this.settings, { maxLength: 0 }),
        );
      }
    } else if (this.UIDObject instanceof User) {
      const settings = JSON.parse(
        fs.readFileSync(`./configs/personal_configs/${this.id}_config.json`).toString(),
      );
      const settingsCollection = this.convertToCollection(settings);
      this.defaultSettings = this.getDefaultSettings();
      if (this.validateAgainstDefault()) this.settings = settingsCollection;
      else {
        console.log(`Personal setting structure for ${this.id} is invalid, Resetting...`);
        this.settings = this.defaultSettings;
        fs.writeFileSync(
          `./configs/personal_configs/${this.id}_config.json`,
          stringify(this.settings, { maxLength: 0 }),
        );
      }
    } else {
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingOrInvalidParameters',
      );
    }
  }

  private validateAgainstDefault(): boolean {
    const difference1 = this.settings.difference(this.defaultSettings);
    const difference2 = this.defaultSettings.difference(this.settings);
    const differences = difference1.concat(difference2);
    if (differences.size !== 0) {
      console.log(differences);
      return false;
    } else {
      // console.log('no differences detected');
      return true;
    }
  }

  private async validateValue(
    settingName: string,
    updatedValue: string | boolean | number,
  ): Promise<boolean> {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName)) {
      console.log(`${this.getSettingCategory(settingName)}: ${settingName}`);
      if (settingName === 'logChannelID') {
        const client = this.UIDObject.client;
        try {
          await client.channels.fetch(updatedValue as string, { force: true });
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      } else if (this.settings.get(settingName).type === 'boolean') {
        console.log('setting category is ephemeral');

        const updatedValueString = `${updatedValue}`;
        return (
          updatedValueString.toLowerCase() === 'true' ||
          updatedValueString.toLowerCase() === 'false'
        );
      } else return true;
    }
  }

  private writeToFile() {
    if (this.UIDObject instanceof Guild) {
      console.log('writing to guild config');
      fs.writeFileSync(
        `./configs/${this.id}_config.json`,
        stringify(this.settings, { maxLength: 0 }),
      );
    } else if (this.UIDObject instanceof User) {
      console.log('writing to personal config');
      fs.writeFileSync(
        `./configs/personal_configs/${this.id}_config.json`,
        stringify(this.settings, { maxLength: 0 }),
      );
    } else
      throw new ConfigErrorHandler(
        'this.UIDObject is neither a Guild or a User.',
        'MissingOrInvalidParameters',
      );
  }

  /**
   * Used to update the settings within the guild's config.
   * @param {string} [settingName] The setting's name.
   * @param {string | boolean} [updatedValue] The updated value.
   */
  public async updateSetting(settingName: string, updatedValue: string | boolean | number) {
    console.log(`update setting called`);
    this.refreshConfigFile();
    console.log(`config refreshed`);
    if (this.doesSettingExist(settingName)) {
      console.log(`setting exists`);
      if (this.getSetting(settingName).toString() !== updatedValue.toString().toLowerCase()) {
        console.log(`updated value is not the same as current value`);
        if (await this.validateValue(settingName, updatedValue)) {
          console.log(`updated value passed validation checks.`);
          if (this.settings.get(settingName).type === 'boolean') {
            console.log(`${settingName} is of boolean type`);
            if ((updatedValue as string).toLowerCase() === 'true') updatedValue = true;
            else if ((updatedValue as string).toLowerCase() === 'false') updatedValue = false;
          }
          // console.log(updatedValue);
          const updatedSetting = {
            name: settingName,
            type: this.settings.get(settingName).type,
            value: updatedValue,
            category: this.getSettingCategory(settingName),
            description: this.settings.get(settingName).description,
          };
          this.settings.set(settingName, updatedSetting);
          // console.log(this.settings.get(settingName));
          console.log(`The setting ${settingName} was accessed and updated to ${updatedValue}.`);
          this.writeToFile();
        } else {
          throw new ConfigErrorHandler(`Invalid value type detected.`, 'InvalidValueType');
        }
      } else {
        throw new ConfigErrorHandler(
          stripIndent`The updated value is identical to the current value. Got ${updatedValue} and config has ${
            this.settings.get(settingName).value
          }`,
          'NoChangesMade',
        );
      }
    } else
      throw new ConfigErrorHandler(
        `The specified setting does not exist. Got ${settingName}`,
        'InvalidSettingName',
      );
  }

  /**
   * Returns the provided setting's value.
   * @param {string} settingName The setting's name that you're looking for.
   * @returns {string | boolean | number | any[]} The setting's current value.
   */

  public getSetting(settingName: string): string | boolean | number | any[] {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName)) {
      console.log(`The setting ${settingName} was accessed.`);
      return this.settings.get(settingName).value;
    } else {
      throw new ConfigErrorHandler(
        `The specified setting does not exist. Got ${settingName}.`,
        'InvalidSettingName',
      );
    }
  }

  /**
   * Returns the provided setting's category.
   * @param {string} settingName The setting's name whose category you want to fetch.
   * @returns {string} The setting's category.
   */

  public getSettingCategory(settingName: string): string {
    this.refreshConfigFile();
    if (this.doesSettingExist(settingName)) return this.settings.get(settingName).category;
    else
      throw new ConfigErrorHandler(
        `The specified setting does not exist. Got ${settingName}`,
        'InvalidSettingName',
      );
  }

  /**
   * Checks whether a provided setting exists.
   * Pretty useless for the end user but good for debugging my stupid mistakes :>
   *
   * @param {string} [settingName] The setting's name.
   * @return {boolean} Whether the setting exists or not.
   */

  private doesSettingExist(settingName: string): boolean {
    this.refreshConfigFile();
    return this.settings.has(settingName);
  }

  /**
   * Takes the settings and converts them to an Array of options
   * for the StringSelectMenuBuilder.
   *
   * @returns {APISelectMenuOption[]} An array of options for SelectMenu.
   */

  public settingsToArrayofOptions(): APISelectMenuOption[] {
    this.refreshConfigFile();
    let arrayOfOptions: APISelectMenuOption[] = [];
    this.settings.forEach((setting) => {
      if (setting.name === 'administrators') return;
      arrayOfOptions.push({
        label: `${setting.category}: ${setting.name}`,
        value: setting.name,
        description: setting.description,
      });
    });
    return arrayOfOptions;
  }

  /**
   * Takes the settings and turns them into a string.
   *
   * @returns {string}
   */

  public toString(): string {
    this.refreshConfigFile();
    return this.settings.toJSON().toString();
  }
}
