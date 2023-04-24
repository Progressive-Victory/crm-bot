import {
	ChatInputCommandInteraction, InteractionResponse, ChannelType, MessageCreateOptions, PermissionFlagsBits
} from 'discord.js';
import Languages from 'src/assets/languages';
import { State } from 'src/declarations/states';
import { Command } from 'src/structures/Command';

const states = Object.values(State);

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	let channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);

	// Check to see if channel is defined
	if (!channel) {
		// Checks to see if channel the command was sent from is a type GuildText
		if (interaction.channel.type !== ChannelType.GuildText) {
			// If the check fails an error state occurs
			return interaction.reply({ content: 'Message Can\'t be sent in this Channel', ephemeral: true });
		}
		// Else channel is set to where the command was used
		channel = interaction.channel;
	}

	// Checks to see if bot has perms to send message in channel
	if (channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
		return interaction.reply({ content: `${interaction.client.user} Does not have permission to send message`, ephemeral: true });
	}

	// Adds Message if the message peramitor was entered
	const stateRole = interaction.member.roles.valueOf().find((role) => states.includes(role.name as State));
	const pingMessage: MessageCreateOptions = { content: stateRole.toString() };
	const message = interaction.options.getString('message');
	if (message) {
		pingMessage.content += `\n${message}`;
	}

	// Sends message to channel
	return channel.send(pingMessage).then((sentMessage) => interaction.reply({
		content: `Ping message has been sent ${sentMessage.url}`,
		ephemeral: true
	})).catch((err) => {
		console.error(err);
		return interaction.reply({
			content: 'An error has accored and the ping message has faild to send',
			ephemeral: true
		});
	});
}

export default new Command({
	name: 'lead',
	execute,
	perms: { client: ['MentionEveryone'] }
});
