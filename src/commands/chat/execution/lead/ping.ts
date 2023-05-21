import {
	ChatInputCommandInteraction, ChannelType, MessageCreateOptions, PermissionFlagsBits 
} from 'discord.js';
import Logger from '../../../../structures/Logger';
import { State } from '../../../../declarations/states';
import { t } from '../../../../i18n';
import { ns } from './index';

const states = Object.values(State);

export default async function ping(interaction: ChatInputCommandInteraction<'cached'>) {
	const { locale } = interaction;
	await interaction.deferReply({ ephemeral: true });
	const errorRes = t({
		key: 'error',
		locale,
		ns
	});
	let channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);

	// Check to see if channel is defined
	if (!channel) {
		// Checks to see if channel the command was sent from is a type GuildText
		if (interaction.channel.type !== ChannelType.GuildText) {
			// If the check fails an error state occurs
			return interaction.followUp({
				content: t({
					key: 'ping-cant-send ',
					locale,
					ns,
					args: { channel: channel.toString() }
				})
			});
		}
		// Else channel is set to where the command was used
		channel = interaction.channel;
	}

	// Checks to see if bot has perms to send message in channel
	if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
		return interaction.followUp({
			content: t({
				key: 'ping-not-no-perms',
				locale,
				ns,
				args: { user: interaction.client.user.toString() }
			})
		});
	}

	const stateRole = interaction.member.roles.valueOf().find((role) => states.includes(role.name as State));
	const pingMessage: MessageCreateOptions = { content: stateRole.toString() };
	const message = interaction.options.getString('message');
	if (message) {
		pingMessage.content += `\n${message}`;
	}

	// Sends message to channel
	return channel
		.send(pingMessage)
		.then((sentMessage) =>
			interaction.followUp({
				content: t({
					key: 'ping-success',
					locale,
					ns,
					args: { url: sentMessage.url }
				})
			})
		)
		.catch((err) => {
			Logger.error(err);
			return interaction.followUp({ content: errorRes });
		});
}
