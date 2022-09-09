const { SlashCommandBuilder } = require("@discordjs/builders")
/*
Command Name: "ban"
Command Purpose: Bans the specified user with a reason.
Command Options (if any): 
- User (User Object, Required)
- Reason (String Option, default: "No reason specified")
- DaysToDeleteMessages (Number Option, default: 0)
Required Permissions: BAN_MEMBERS (1 << 2)
Checks (if any): 
- Is the specified user not the same as the triggering user?
- Is the specified user not higher in roles then the triggering user?
- Is the specified user not higher in roles than the bot?
- Is the specified amount of days higher than the limit (7)?
 */
module.exports = {
    data: new SlashCommandBuilder()
    .setName("ban") // Sets the name.
    .setDescription("Bans the specified user.") // Sets the description.
    .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
    .addUserOption((option) => { // Adds the options.
        return option
        .setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    })
    .addStringOption((option) => {
        return option
        .setName("reason")
        .setDescription("The reason for the ban.")
    })
    .addIntegerOption((option) => {
        return option
        .setName("delete_messages")
        .setDescription("The amount of days of messages to delete after banning.")
    }),
    async execute(interaction) { // Executes the command.
        try {
            // Funnels the provided aguments into variables.
            const specifiedUser = interaction.options.getUser("user")
            let reason = interaction.options.getString("reason", false)
            const guildBans = interaction.guild.bans
            const deleteMessageSeconds = 24*60*60*(interaction.options.getInteger("delete_messages", false)) // Convert days to seconds. Required by Discord's API.

            if (interaction.user.equals(specifiedUser)) { // If the specified user = the triggering user, end and notify the user.
                return interaction.reply({
                    content: "You can't ban yourself!",
                    ephemeral: true,
                })
            } else if (interaction.client.user.equals(specifiedUser)) { // How dare you target the bot?
                await interaction.reply({
                    content: "...Sure thing boss...",
                    ephemeral: true,
                })
                await new Promise(r => setTimeout(r, 3000))
                await guildBans.create(specifiedUser, {days: null, deleteMessageSeconds: deleteMessageSeconds, reason: reason}) // Fortunately, Discord won't let that happen because of the role hierarcy. You monster.
                .catch(error => {
                    return interaction.editReply("Sorry boss, Discord won't let me...");
                })
                return;
            } else if (interaction.user.roles.highest.comparePositionTo(specifiedUser.roles.highest) >= 0) { // If the triggering user is higher in the hierarcy than the specified user, end and notify the user.
                console.log(`${interaction.user.tag} has insufficent permissions to kick ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`)
                return interaction.reply({
                content: `The user ${specifiedUser} is at a higher (or equals) role than you and 
                cannot be banned by you.`,
                ephemeral: true,
                })
            } else if (deleteMessageSeconds > 604800) { // If the number of days are above the limit (7 or, in seconds, 607800),
                                                        // end and notify the user.
                return interaction.reply({
                    content: `The amount of days specified is higher than the maximum of 7 days.
                    (Your input: \`${deleteMessageSeconds/24/60/60}\`)`,
                    ephemeral: true,
                })
            }

            if (reason == null) {
                reason = "No reason provided." // If the reason was empty, replace it with "No reason provided."
            }

            await guildBans.create(specifiedUser, {days: null, deleteMessageSeconds: deleteMessageSeconds, reason: reason})
            .catch(error => { // Ban the specified user with the given days and reason (if any) and catch if there's an error.
                // console.log(error.code)
				if (error.code == 50013) { // if the error was "DiscordAPIError: Missing Permissions",
					if (!specifiedUser.manageable) { // check that the bot *can* manage the specified user and if not, end and notify the user.
						console.log(`The specified user ${specifiedUser.tag} is higher than the bot's role. (Staff member?)`)
						return interaction.reply({
							content: `This user (${specifiedUser}) is higher than me in roles.
							Are you trying to ban a staff member?`,
							ephemeral: true,
						})
					} else { // if the bot somehow gave you this response, please let me know on discord (ItsLegend#9697). I am geniuenly curious how you got here.
						console.log(`${interaction.user.tag} has insufficent permissions to ban ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`)
                		return interaction.reply({
                    	content: `The user ${specifiedUser} is at a higher role than you and 
						cannot be banned by you.`,
                    	ephemeral: true,
						})
					}
			    }
                return;
            })
            if (!interaction.replied){ // checks that the interaction wasn't already replied to (in case one of the error conditions above were triggered).
                console.log(`The user ${interaction.user.tag}(id: ${interaction.user.id}) has successfully banned ${specifiedUser.tag}(id: ${specifiedUser.id}) from ${interaction.guild.name}(id: ${interaction.guild.id}).`)
                return interaction.reply({
                    content: `The user ${specifiedUser} has been banned for: ${reason}.`
            }).catch(error => console.log(error))}
            } catch (err) {
                console.log(err);
            }
        }
    }