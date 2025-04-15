import {
	GuildBasedChannel,
	GuildMember,
	InteractionContextType, PermissionFlagsBits,
	TextChannel
} from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { localize } from '../../i18n.js';

export const commandName = 'purge-roleless';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName(commandName)
		.setDescription('Purges all server members without the specified role.')
		.setNameLocalizations(localize.discordLocalizationRecord('name', commandName))
		.setNameLocalizations(localize.discordLocalizationRecord('description', commandName))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setContexts(InteractionContextType.Guild)
		.addBooleanOption(option => option
					.setName('dryRun')
					.setDescription('Whether to actually perform the kick or just do a test run')
					.setRequired(true)))
	.setExecute(async (interaction) => {
		const {
			options, locale, user 
		} = interaction;

		const isDryRun: boolean = options.getBoolean("dryRun", true);
		//const validRoles = [1009925501344825432, 1016379207917506660, 928709707542175818]; // Verified, Wesbite Form filled, Affiliated Content Creater - LIVE SERVER ROLE IDS
		const validRoles = ['1308908208479408268', '1308906579931693116']; // Verified, Website form filled - DEV SERVER ROLE IDS

		//const cutoffRole = 1313919830281158666; // If the target has a role above this one, they are not kicked and instead given to a admin to warn - LIVE SERVER
		const cutoffRole = '1311739533460635688'; // DEV SERVER

		//const warnChannelId = '1314339679428022292'; // LIVE SERVER
		const warnChannelId = '1348341069397626952'; // DEV SERVER
		// Get current guild
		const guild = interaction.guild;
		if (guild != null) {
			// Iterate over all members
			let warnMembers: GuildMember[] = [];
			let kickMembers: GuildMember[] = [];
			guild.members.cache.forEach(member => {
				// Do they have a valid role?
				const hasValidRole: boolean = member.roles.cache.some(role => validRoles.some(arrayId => arrayId === role.id));
				if (!hasValidRole) {
					// Check if we should warn instead of kicking - do they have at least 1 role higher than the cutoff role?
					const shouldWarnInstead: boolean = member.roles.cache.some(role => guild.roles.comparePositions(role, cutoffRole) >= 0);
					if (shouldWarnInstead) {
						warnMembers.push(member);
					} else {
						kickMembers.push(member);
					}
				}
			});
			const warnChannel: GuildBasedChannel | null = await guild.channels.fetch(warnChannelId);
			if (isDryRun) {
				// Log message in warn channel
				let messageKick: string = 'Members who would be kicked:\n';
				if (warnChannel != null && warnChannel.isTextBased()) {
					for (let i = 0; i < kickMembers.length; i++) {
						messageKick += kickMembers[i] + '\n';
						if (messageKick.length > 1800) {
							await (warnChannel as TextChannel).send(messageKick);
							// Reset header
							messageKick = 'Members who would be kicked:\n';
						}
					}
					await (warnChannel as TextChannel).send(messageKick);
				}
				// Warn Admins with list
				let messageWarn: string = 'Members who do not have the valid roles:\n';
				if (warnChannel != null && warnChannel.isTextBased()) {
					for (let i = 0; i < warnMembers.length; i++) {
						messageWarn += warnMembers[i] + '\n';
						if (messageWarn.length > 1800) {
							await (warnChannel as TextChannel).send(messageWarn);
							// Reset header
							messageWarn = 'Members who do not have the valid roles:\n';
						}
					}
					await (warnChannel as TextChannel).send(messageWarn);
				}
			} else {
				// Initiate mass kick
				kickMembers.forEach(async member => {
					await member.kick("You have not completed validation.");
					await member.send('You have been kicked from the Progressive Victory server. To rejoin, please complete the validation on the website or through discord.');
				});
				// Warn Admins with list
				let message: string = 'Members who do not have the valid roles:\n';
				if (warnChannel != null && warnChannel.isTextBased()) {
					for (let i = 0; i < warnMembers.length; i++) {
						message += warnMembers[i] + '\n';
						if (message.length > 1800) {
							await (warnChannel as TextChannel).send(message);
							// Reset header
							message = 'Members who do not have the valid roles:\n';
						}
					}
					await (warnChannel as TextChannel).send(message);
				} else {
					console.log("Unable to find warn text channel!");
				}
			}
		} else {
			return interaction.reply({
				content: "Needs to be in a guild to execute the command."
			});
		}
	});
