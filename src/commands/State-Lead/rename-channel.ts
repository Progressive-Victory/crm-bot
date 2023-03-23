import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse,
	Snowflake,
	VoiceChannel
} from 'discord.js';
import { VCChannelIDs } from '../../structures/Constants';
import { State } from '../../declarations/states';
import { Command } from '../../structures/Command';

const states = Object.values(State);

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	let reply:string;
	const allowedChannels: Snowflake[] = VCChannelIDs;
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;
	const name = interaction.options.getString('name', true);

	if (!allowedChannels.includes(channel.id)) {
		reply = `You are not allowed to rename ${channel}`;
	}
	else {
		if (!channel.permissionsFor(interaction.client.user).has('ManageChannels')) {
			return interaction.reply({ ephemeral: true, content: `I do not have permission to manage ${channel}.` });
		}

		await channel.setName(name, 'State Lead has renamed this channel');
		reply = `${channel} has been Successfully renamed`;
	}

	return interaction.reply({ ephemeral: true, content: reply });
}
async function autocomplete(interaction: AutocompleteInteraction) {
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.valueOf().find((role) => states.includes(role.name as State));
	const focusedOption = interaction.options.getFocused(true);
	const choices = [`${stateRole.name} Meeting`];

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(
		filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14)
	);
}
export default new Command({
	execute,
	autocomplete,
	name: 'state-lead'
});
