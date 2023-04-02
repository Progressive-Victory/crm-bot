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
import Languages from '../../../assets/languages';

const states = Object.values(State);

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;

	let reply: string;
	const allowedChannels: Snowflake[] = VCChannelIDs;
	const name = interaction.options.getString('name', true);

	if (!allowedChannels.includes(channel.id)) {
		reply = Languages[interaction.language].Commands.Lead.VC.Rename.WrongChannel(channel, allowedChannels);
	}
	else {
		await channel.setName(name, Languages[interaction.guild.preferredLanguage].Commands.Lead.VC.Rename.AuditLogRename(channel, interaction.user));
		reply = Languages[interaction.language].Commands.Lead.VC.Rename.Success(channel);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

async function autocomplete(interaction: AutocompleteInteraction) {
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.valueOf().find((role) => states.includes(role.name as State));
	const stateChannel = REGION_ABBREVIATION_MAP[interaction.channel.name];
	const focusedOption = interaction.options.getFocused(true);

	const choices = [];
	if (stateChannel) choices.push(`${stateChannel} ${Languages[interaction.guild.preferredLanguage].Objects.Meeting}`);
	choices.push(`${stateRole.name} ${Languages[interaction.guild.preferredLanguage].Objects.Meeting}`);

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(
		filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14)
	);
}

export default new Command({
	execute,
	autocomplete,
	name: 'lead',
	group: 'vc',
	perms: { client: ['ManageChannels'] }
});
