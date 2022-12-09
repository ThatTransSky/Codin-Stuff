class ConfigErrorHandler extends Error {
    constructor(message, type) {
        super(message)
        this.name = 'ConfigErrorHandler'
        this.type = type
    }
}

module.exports = ConfigErrorHandler