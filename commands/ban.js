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
- If the specified user is the same as the triggering user.
- Returns if the specified user is higher in roles then the triggering user.
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
            const specifiedUser = interaction.guild.members.resolve(interaction.options.getUser("user"))
            const reason = interaction.options.getString("reason", false)
            const deleteMessageSeconds = 24*60*60*(interaction.options.getInteger("delete_messages", false)) // Convert days to seconds. Required by Discord's API.

            if (specifiedUser.user.tag === interaction.user.tag) { // If the specified user = the triggering user, end and notify the user.
                return interaction.reply({
                    content: "You can't ban yourself!",
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

            if ((typeof reason) === undefined) {
                reason = "No reason provided." // If the reason was empty, replace it with "No reason provided."
            }

            await specifiedUser.ban({deleteMessageSeconds, reason}).catch(error => { // Ban the specified user with the given days and reason (if any) and catch if there's an error.
                // console.log(error.code)
				if (error.code == 50013) { // if the error was "DiscordAPIError: Missing Permissions",
					if (!specifiedUser.manageable) { // check that the bot *can* manage the specified user and if not, end and notify the user.
						console.log(`The specified user ${specifiedUser.displayName} is higher than the bot's role. (Staff member?)`)
						return interaction.reply({
							content: `This user (${specifiedUser}) is higher than me in roles.
							Are you trying to ban a staff member?`,
							ephemeral: true,
						})
					} else { // if the bot somehow gave you this response, please let me know on discord (ItsLegend#9697). I am geniuenly curious how you got here.
						console.log(`${interaction.user.tag} has insufficent permissions to ban ${specifiedUser.displayName}. (DiscordAPIError: MissionPermissions)`)
                		return interaction.reply({
                    	content: `The user ${specifiedUser} is at a higher role than you and 
						cannot be banned by you.`,
                    	ephemeral: true,
						})
					}
			}})
            if (!interaction.replied){ // checks that the interaction wasn't already replied to (in case one of the error conditions above were triggered).
                console.log(`The user ${interaction.user.tag}(id: ${interaction.user.id}) has successfully banned ${specifiedUser.displayName}(id: ${specifiedUser.id}) in the guild ${interaction.guild.name}(id: ${interaction.guild.id}).`)
                return interaction.reply({
                    content: `The user ${specifiedUser} has been banned for: ${reason}.`,
                    ephemeral: true,     
            }).catch(error => console.log(error))}
            } catch (err) {
                console.log(err);
            }
        }
    }