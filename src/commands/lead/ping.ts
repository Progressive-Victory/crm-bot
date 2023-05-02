import {
	ChatInputCommandInteraction, ChannelType, MessageCreateOptions, PermissionFlagsBits 
} from 'discord.js';
import Languages from '../../assets/languages';
import { State } from '../../declarations/states';
import { Command } from '../../structures/Command';

const states = Object.values(State);

async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });
	const lang = Languages[interaction.language];
	const response = lang.Commands.Lead.Ping;
	const errorRes = lang.Generics.Error();
	let channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);

	// Check to see if channel is defined
	if (!channel) {
		// Checks to see if channel the command was sent from is a type GuildText
		if (interaction.channel.type !== ChannelType.GuildText) {
			// If the check fails an error state occurs
			return interaction.followUp({ content: response.CantSend() });
		}
		// Else channel is set to where the command was used
		channel = interaction.channel;
	}

	// Checks to see if bot has perms to send message in channel
	if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
		return interaction.followUp({ content: response.BotNoPerms(interaction.client.user) });
	}

	// Adds Message if the message peramitor was entered
	const stateRole = interaction.member.roles.valueOf().find((role) => states.includes(role.name as State));
	const pingMessage: MessageCreateOptions = { content: stateRole.toString() };
	const message = interaction.options.getString('message');
	if (message) {
		pingMessage.content += `\n${message}`;
	}

	// Sends message to channel
	return channel
		.send(pingMessage)
		.then((sentMessage) => interaction.followUp({ content: response.Success(sentMessage) }))
		.catch((err) => {
			console.error(err);
			return interaction.followUp({ content: errorRes });
		});
}

export default new Command({
	name: 'lead',
	execute,
	perms: { client: ['MentionEveryone'] }
});
