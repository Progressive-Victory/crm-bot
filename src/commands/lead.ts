/* eslint-disable no-shadow */
import {
	ChatInputCommandInteraction, VoiceChannel, Snowflake, AutocompleteInteraction, GuildMember, PermissionFlagsBits, ChannelType, InteractionResponse
} from 'discord.js';
import i18n from 'i18next';
import { localize } from '../i18n';
import { State } from '../declarations/states';
import { VCChannelIDs, REGION_ABBREVIATION_MAP } from '../structures/Constants';
import { ChatInputCommand } from '../structures/Command';
import Logger from '../structures/Logger';

const regionLeadRoleID: Snowflake = process.env.REGIONAL_ROLE_ID;

const states = Object.values(State);

// NameSpace for i18next
const ns = 'lead';

/**
 * Renames a VC
 * @param interaction command interaction
 * @returns interaction response
 */
async function renameVc(interaction: ChatInputCommandInteraction<'cached'>) {
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;

	let reply: string;
	const allowedChannels: Snowflake[] = VCChannelIDs;
	const name = interaction.options.getString('name', true);

	if (!allowedChannels.includes(channel.id)) {
		reply = i18n.t('vc-rename-wrong-channel', {
			lng: interaction.locale,
			ns,
			channel: channel.toString(),
			channels: `${allowedChannels.map((id) => `<#${id}>`).join(', ')}`
		});
	}
	else {
		await channel.setName(name, i18n.t('vc-rename-Audit-Log-Rename', {
			lng: interaction.locale, ns, name: channel.name, tag: interaction.user.tag
		}));
		reply = i18n.t('vc-rename-success', {
			lng: interaction.locale,
			ns,
			channel: channel.toString()
		});
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

/**
 * responds to autocomplete requests
 * @param interaction command interaction
 * @returns interaction response
 */
async function autocomplete(interaction: AutocompleteInteraction<'cached'>) {
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.cache.find((role) => states.includes(role.name as State));
	const stateChannel = REGION_ABBREVIATION_MAP[interaction.channel.name];
	const focusedOption = interaction.options.getFocused(true);
	const meeting = i18n.t('metting', { lng: interaction.guild.preferredLocale, ns });
	const choices = [];
	if (stateChannel) choices.push(`${stateChannel} ${meeting}`);
	choices.push(`${stateRole.name} ${meeting}`);

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(
		filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14)
	);
}

function memberState(member: GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
}

/**
 * Function for toggling regoinlead role on and off
 * @param interaction command interaction
 * @returns interaction response
 */
async function role(interaction: ChatInputCommandInteraction<'cached'>) {
	// gets member from interation
	const target = interaction.options.getMember('user');

	// state lead is the user who used the command
	const stateLead = interaction.member;

	// if the state lead and the target member do not have thet same state role
	if (!memberState(stateLead).some((role) => memberState(target).has(role.id))) {
		return interaction.reply({
			ephemeral: true,
			content: i18n.t('role-region-mismatch', {
				lng: interaction.locale,
				ns,
				user: target.toString()
			})
		});
	}

	const regionLeadRole = stateLead.guild.roles.cache.get(regionLeadRoleID);
	if (!regionLeadRole) {
		return interaction.reply({
			ephemeral: true,
			content: i18n.t('norole', {
				lng: interaction.locale,
				ns: 'comman'
			})
		});
	}

	const hasRegionLeadRole = target.roles.cache.has(regionLeadRole.id);
	let reply: string = null;
	const auditReason = i18n.t('role-success-remove', {
		lng: interaction.locale,
		ns,
		tag: target.user.tag
	});

	try {
		if (!hasRegionLeadRole) {
			await target.roles.add(regionLeadRoleID, auditReason);
			reply = i18n.t('role-success-add', {
				lng: interaction.locale,
				ns,
				role: regionLeadRole.toString(),
				user: target.toString()
			});
		}
		else {
			await target.roles.remove(regionLeadRoleID, auditReason);
			reply = i18n.t('role-success-remove', {
				lng: interaction.locale,
				ns,
				role: regionLeadRole.toString(),
				user: target.toString()
			});
		}
	}
	catch (e) {
		reply = i18n.t('role-error', {
			lng: interaction.locale,
			ns,
			role: regionLeadRole.toString()
		});
		Logger.error(e);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

/**
 * Command objects to be exported
 */
export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('lead')
		.setDescription('Commands for leads to help manage their respective regions')
		.setNameLocalizations(localize('command-name', { ns }))
		.setDescriptionLocalizations(localize('command-description', { ns }))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels)
		.setDMPermission(false)
		.addSubcommandGroup((subcommandGroup) => subcommandGroup
			.setName('region')
			.setDescription('Region Lead utilities')
			.setNameLocalizations(localize('region-name', { ns }))
			.setDescriptionLocalizations(localize('region-description', { ns }))
			.addSubcommand((subcommand) => subcommand
				.setName('role')
				.setDescription('Toggle Regional Lead role')
				.setNameLocalizations(localize('region-role-name', { ns }))
				.setDescriptionLocalizations(localize('region-role-description', { ns }))
				.addUserOption((option) => option
					.setName('user')
					.setDescription('Target user')
					.setNameLocalizations(localize('region-role-user-name', { ns }))
					.setDescriptionLocalizations(localize('region-role-user-description', { ns }))
					.setRequired(true))))
		.addSubcommandGroup((subcommandGroup) => subcommandGroup
			.setName('vc')
			.setDescription('Manage voice channels')
			.setNameLocalizations(localize('vc-name', { ns }))
			.setDescriptionLocalizations(localize('vc-description', { ns }))
			.addSubcommand((subcommand) => subcommand
				.setName('rename')
				.setDescription('Rename organizing voice channels')
				.setNameLocalizations(localize('vc-rename-name', { ns }))
				.setDescriptionLocalizations(localize('vc-rename-description', { ns }))
				.addChannelOption((options) => options
					.setName('channel')
					.setDescription('The channel to rename')
					.setNameLocalizations(localize('vc-rename-channel-name', { ns }))
					.setDescriptionLocalizations(localize('vc-rename-channel-description', { ns }))
					.setRequired(true)
					.addChannelTypes(ChannelType.GuildVoice))
				.addStringOption((option) => option
					.setName('name')
					.setDescription('Name to set the channel to')
					.setNameLocalizations(localize('vc-rename-name-name', { ns }))
					.setDescriptionLocalizations(localize('vc-rename-name-description', { ns }))
					.setRequired(true)
					.setAutocomplete(true)
					.setMinLength(5)
					.setMaxLength(100)))))
	.setExecute(async (interaction): Promise<InteractionResponse<true>> => {
		// Type check that interaction is in guild
		if (!interaction.inCachedGuild()) throw Error;

		// Gets subcommand
		const subcommand = interaction.options.getSubcommand(true);

		// runs fuctions based on subcommand
		switch (subcommand) {
		case 'rename':
			return renameVc(interaction);
		case 'role':
			return role(interaction);
		default:
			throw Error;
		}
	})
	.setAutocomplete(autocomplete);
