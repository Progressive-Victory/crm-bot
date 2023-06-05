import {
	ChannelType,
	ChatInputCommandInteraction,
	MessageCreateOptions, PermissionFlagsBits
} from 'discord.js';
import { Logger } from 'src/Client';
import { State } from 'src/declarations/states';
import { t } from 'src/i18n';
import { ns } from '../../builders/lead';

const states = Object.values(State);

/**
 * Executes the ping command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 */
export default async function ping(interaction: ChatInputCommandInteraction<'cached'>) {
	const { locale } = interaction;

	// Defer the reply to indicate that the bot is processing the command.
	await interaction.deferReply({ ephemeral: true });

	// Get the channel option from the interaction's options, if provided.
	let channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);

	// Check if the channel option is defined.
	if (!channel) {
		// Check if the command was sent from a GuildText channel.
		if (interaction.channel.type !== ChannelType.GuildText) {
			// If not, send an error response indicating that the command cannot be sent.
			return interaction.followUp({
				content: t({
					key: 'ping-cant-send',
					locale,
					ns,
					args: { channel: channel.toString() }
				})
			});
		}
		// If the channel option is not provided, set the channel to the channel where the command was used.
		channel = interaction.channel;
	}

	// Check if the bot has permission to send messages in the channel.
	if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
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

	// Get the state role of the interaction member.
	const stateRole = interaction.options.getRole('role') || interaction.member.roles.valueOf().find((role) => states.includes(role.name as State));

	// Create the message content for pinging the role.
	const pingMessage: MessageCreateOptions = { content: stateRole.toString() };

	// Get the additional message content from the 'message' option, if provided.
	const message = interaction.options.getString('message');
	if (message) {
		pingMessage.content += `\n${message}`;
	}

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
		Logger.error(err);

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
