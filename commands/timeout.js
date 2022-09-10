const { SlashCommandBuilder } = require("@discordjs/builders")
/*
Command Name: "timeout"
Command Purpose: Timeout a user in the guild for a specified amount of minutes.
Command Options (if any):
- User (User Option, Required)
- Duration in Minutes (Number Option, Required)
- Reason (String Option)
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any):
- Is the specified user not the same as triggering user?
- Is the specified user not the same as the bot?
- Is the duration specified below the API limit? (20160 minutes//2 weeks)
- Is the specified user in the current guild?
- Does the specified user not have the Administrator permission?
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("timeout") // Sets the name
    .setDescription("Time out a user") // Sets the description
    .setDefaultMemberPermissions(1 << 40) // Sets the required permissions
	// Adding the options
    .addUserOption((option) => { 
        return option
        .setName("user")
        .setDescription("The User to Timeout.")
        .setRequired(true)
    })
    .addNumberOption((option) => {
        return option
        .setName("duration_in_minutes")
        .setDescription("How long should the timeout be? (in minutes)")
        .setRequired(true)
    })
    .addStringOption((option) => {
        return option
        .setName("reason")
        .setDescription("The reason for the timeout.")
    }),
    async execute(interaction) {
        try {
	        // Necessary constants
	        const {client} = interaction
	        const guildMembers = await interaction.guild.members
	        // Funnels the provided options into variables.
	        const specifiedUser = interaction.options.getUser("user")
	        const specifiedGuildMember = await guildMembers.fetch(specifiedUser).catch(error => {})
	        // The .catch ^here^ is implemented to prevent the bot from crashing.
	        // We don't need to handle the error at the moment cause it will be addressed later on in the code.
	        const duration = interaction.options.getNumber("duration_in_minutes")*60*1000
			// ^Converts Minutes into Milliseconds for Discord's API^.
	        let reason = interaction.options.getString("reason")
	
	        if (interaction.user.equals(specifiedUser)) { // If the specified user = triggering user, end and notify user.
	            return interaction.reply({
	                content: "You can't timeout yourself!",
	                ephemeral: true,
	            })
	        } else if (client.user.equals(specifiedUser)) { // Again with targeting the bot. When will you learn?
	            return interaction.reply({
	                content: "I can't timeout myself.",
	                ephemeral: true,
	            })
	        } else if ((duration/60/1000) > 20160) {
				// Discord (for some reason) decided the limit for how long a time out can be is 20160 minutes,
				// which is 2 weeks. The reason why it's bizarre is because their own built-in timeout command
				// doesn't even have 2 weeks as an option.
                return interaction.reply({
                    content: "The duration provided is higher than the current limit! (Current limit: 20160)",
                    ephemeral: true,
                })
            }
	
	        try {
	            // If the specified user is higher in the hierarcy than the triggering user, end and notify the user.
	            if (interaction.member.roles.highest.comparePositionTo(specifiedGuildMember.roles.highest) <= 0) {
	                console.log(`${interaction.user.tag} has insufficent permissions to kick ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`)
	                return interaction.reply({
	                    content: `The user ${specifiedUser} is at a higher (or equals) role than you and cannot be timed out by you.`,
	                    ephemeral: true,
	                })
	            }
	        } catch (error) {
				// It's necessary that we reply and end the command here because timeout requires the user to be in the server.
	            console.error("Couldn't check roles hierarcy, User isn't in the Guild.")
	            return interaction.reply({
	                content: "This User is not currently in the Server and cannot be timed out.",
	                ephemeral: true,
	            })
	        }
	
	        if (reason == null) {
	            reason = "No reason provided."
	        }

			if (specifiedGuildMember.roles.highest.permissions.has(1 << 3)) {
				// You can absolutely time out a user with Administrator permissions, it just won't do anything.
				// Pretty sure it's because of that "bypass channel restrictions" that the Administrator permission has.
				console.log("The specified user is an administrator.")
				return interaction.reply({
					content: `The specified user has Administrator permissions therefor, timing them out won't do anything.`,
					ephemeral: true,
				})
			}
	
	        await specifiedGuildMember.timeout(duration, [reason]).catch(error => {
				// If the error was "Mission Permissions", check that the specified user is manageable by the bot.
	            if (error.code == 50013) { 
	                if (!specifiedGuildMember.manageable) {
	                    console.log(`The specified user ${specifiedUser.tag} is higher in roles than the bot. (Staff member?)`)
	                    return interaction.reply({
	                        content: `The specified user (${specifiedUser.tag}) is higher than me in the hierarcy and therefor cannot be timed out by me.`,
	                        ephemeral: true,
	                    })
	                }
	            } else {
	                console.log(error.message)
	                return interaction.reply({
	                content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(process.env.CREATOR_ID)}) (Error message: ${error.message}))`,
	                ephemeral: true,
	                })
	            }
	        })

            if(!interaction.replied) {
                console.log(`Successfully timed out ${specifiedUser.tag} for ${duration} milliseconds!`)
                return interaction.reply({
                    content: `Successfully timed out ${specifiedUser} for ${duration/60/1000} minutes! (Reason: ${reason})`,
                })
            }

        } catch (error) {
            console.log(error);
        }
    }
}