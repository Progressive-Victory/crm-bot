import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse,
	Snowflake,
	VoiceChannel
} from 'discord.js';
import { REGION_ABBREVIATION_MAP, VCChannelIDs } from '../../../structures/Constants';
import { State } from '../../../declarations/states';
import { Command } from '../../../structures/Command';

const states = Object.values(State);

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;

	if (!channel.permissionsFor(interaction.client.user).has('ManageChannels')) {
		return interaction.reply({ ephemeral: true, content: `I do not have permission to manage ${channel}.` });
	}

	let reply: string;
	const allowedChannels: Snowflake[] = VCChannelIDs;
	const name = interaction.options.getString('name', true);
	const stateLead = interaction.member;

	if (!allowedChannels.includes(channel.id)) {
		reply = `You are not allowed to rename ${channel}. However, you can rename any of the following channels: ${allowedChannels.map((id) => `<#${id}>`).join(', ')}.`;
	}
	else {
		await channel.setName(name, `${stateLead.user.tag} renamed ${channel.name}`);
		reply = `${channel} has been successfully renamed!`;
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

async function autocomplete(interaction: AutocompleteInteraction) {
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.valueOf().find((role) => states.includes(role.name as State));
	const stateChannel = REGION_ABBREVIATION_MAP[interaction.channel.name];
	const focusedOption = interaction.options.getFocused(true);

	const choices = [];
	if (stateChannel) choices.push(`${stateChannel} Meeting`);
	choices.push(`${stateRole.name} Meeting`);

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(
		filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14)
	);
}

export default new Command({
	execute,
	autocomplete,
	name: 'lead',
	group: 'vc'
});
