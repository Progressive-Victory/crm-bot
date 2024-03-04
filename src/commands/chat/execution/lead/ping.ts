import { ns } from '@builders/lead';
import { t } from '@i18n';
import { logger } from '@progressive-victory/client';
import {
	ChatInputCommandInteraction, MessageCreateOptions, PermissionFlagsBits 
} from 'discord.js';
import {
	Channels, getSMERole, isMemberStateLead, memberStates, states 
} from '../../../../structures';

/**
 * Executes the ping command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 */
export default async function ping(interaction: ChatInputCommandInteraction<'cached'>) {
	const { locale } = interaction;

	// Defer the reply to indicate that the bot is processing the command.
	await interaction.deferReply({ ephemeral: true });

	// Get the channel option from the interaction's options, if provided.
	const { channel } = interaction;

	// Check if the bot has permission to send messages in the channel.
	if (channel.guild && !channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
		// If not, send an error response indicating that the bot does not have permission to send messages.
		return interaction.followUp({
			content: t({
				key: 'ping-not-no-perms',
				locale,
				ns,
				args: { user: interaction.client.user.toString() }
			})
		});
	}

	const stateChannel = states.find((s) => {
		const adaptedStateName = s.name.toLowerCase().replace(/ /g, '-');
		return interaction.channel.name.toLowerCase() === adaptedStateName || interaction.channel.parent?.name.toLowerCase() === adaptedStateName;
	});
	const stateAbbreviation = stateChannel?.abbreviation;
	const smeChannel = Channels.some((name) => interaction.channel.name === name || interaction.channel.parent?.name === name);

	// Get the SME role of the interaction member, the alternative to the state lead ping is SME (Subject Matter Expert) role.
	const smeRole = smeChannel && getSMERole(interaction.member);
	// Get the state role of the interaction member.
	const stateRole = stateAbbreviation && interaction.guild.roles.cache.find((r) => stateAbbreviation.toLowerCase() === r.name.toLowerCase());

	const isStateLead = stateAbbreviation && isMemberStateLead(interaction.member);
	const hasStateRole = memberStates(interaction.member).some((r) => r.id === stateRole?.id);

	if (!stateChannel && !smeChannel) {
		return interaction.followUp({
			content: t({
				key: 'ping-invalid-channel',
				locale,
				ns
			})
		});
	}

	if (stateChannel) {
		if (!stateRole) {
			return interaction.followUp({
				content: t({
					key: 'ping-state-role-not-found',
					locale,
					ns
				})
			});
		}

		if (!hasStateRole) {
			return interaction.followUp({
				content: t({
					key: 'ping-no-state-role',
					locale,
					ns
				})
			});
		}

		if (!isStateLead) {
			return interaction.followUp({
				content: t({
					key: 'ping-not-state-lead',
					locale,
					ns
				})
			});
		}
	}

	if (smeChannel && !smeRole) {
		return interaction.followUp({
			content: t({
				key: 'ping-no-sme-role',
				locale,
				ns
			})
		});
	}

	const pingRole = stateRole || smeRole;

	// Create the message content for pinging the role.
	const pingMessage: MessageCreateOptions = { content: pingRole.toString() };

	// Get the additional message content from the 'message' option, if provided.
	const message = interaction.options.getString('message');
	if (message) {
		pingMessage.content += `\n${message}`;
	}

	pingMessage.content += `\n> Sent by ${interaction.user}`;

	try {
		// Send the ping message to the channel.
		const sentMessage = await channel.send(pingMessage);

		// Send a success response with the URL of the sent message.
		return interaction.followUp({
			content: t({
				key: 'ping-success',
				locale,
				ns,
				args: { url: sentMessage.url }
			})
		});
	}
	catch (err) {
		// Log the error.
		logger.error(err);

		// Send an error response if sending the message fails.
		return interaction.followUp({
			content: t({
				key: 'error',
				locale,
				ns
			})
		});
	}
}
