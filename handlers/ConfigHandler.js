const fs = require(`fs`);
const ConfigErrorHandler = require("./ConfigErrorHandler");

/**
 * ConfigHandler (I FUCKING DID IT WOOOOOO):
 * Creates a Config Class to allow for the reading and
 * writing of a predefined settings file.
 * 
 * TODO:
 * - Allow for the creation of the file (with pre-defined defaults) 
 *   in case the file doesn't exists.
 * - Extend that for other servers that are yet to have an
 *   existing Config file. (Format: <server_id>_config.json)
 * @property {String} [guildID]
 * @property {Object} [settings]
 */


class Config extends ConfigErrorHandler {
    
      constructor(guildID) {
        super()
        if (guildID === "") {
            throw new ConfigErrorHandler('The guildID cannot be empty.', 'InvalidGuildID')
        }
        this.guildID = guildID
        try {
            const settings = JSON.parse(fs.readFileSync(`./configs/${guildID}_config.json`));
            this.settings = {}
            for (const [settingName, value] of Object.entries(settings)) {
                this.settings[settingName] = value
            }   
        } catch (error) {
            if (error.code === `ENOENT`) {
                console.log(`The config for ${guildID} is missing. Creating...`);
                const settings = this.createMissingConfigFile(guildID)
                this.settings = {}
                for (const [settingName, value] of Object.entries(settings)) {
                    this.settings[settingName] = value
                }
            }
        }
        console.log('----\nConfig instance successfully created.\n----');
      }


      createMissingConfigFile(guildID) {

        const defaultSettings = JSON.parse(fs.readFileSync(`./configs/default.json`))
        fs.writeFileSync(`./configs/${guildID}_config.json`, JSON.stringify(defaultSettings))
        return defaultSettings

      }
    //I don't really think this will have any actual use, considering
    //the Config Object gets remade every time.

    //Huh. Guess I was wrong :/
    refreshConfigFile() {
        
        const settings = JSON.parse(fs.readFileSync(`./configs/${this.guildID}_config.json`))

        this.settings = {}
        for (const [settingName, value] of Object.entries(settings)) {
            this.settings[settingName] = value
        }
        return this.settings
    }
    
    updateSetting(settingName, value) {

        this.settings = this.refreshConfigFile()
        this.settings[settingName] = value
        fs.writeFileSync(`./configs/${this.guildID}_config.json`, JSON.stringify(this.settings))
        
    }

    getSetting(settingName) {

        this.settings = this.refreshConfigFile()
        // console.log(this.settings[settingName])
        return this.settings[settingName]
    
    }

    toString() {

        this.settings = this.refreshConfigFile()
        const settingsStringified = ``
        for (const [settingName, value] of Object.entries(this.settings)) {
            settingsStringified += `${settingName}=${value}`
        }
        return settingsStringified

    }
}

module.exports = Config;