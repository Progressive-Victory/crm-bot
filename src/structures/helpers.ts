import { readdir } from 'fs/promises';
import { resolve } from 'path';

import {
	ChatInputCommandInteraction,
	CommandInteraction,
	GuildMember,
	PermissionFlagsBits,
	Snowflake,
	User,
	VoiceBasedChannel
} from 'discord.js';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import Languages from '../assets/languages';
import { REGION_ABBREVIATION_MAP, VCChannelNames } from './Constants';
import Logger from './Logger';

config();

export function isConnectEmoji(str: string) {
	return [
		process.env.VERIFY_EMOJI,
		process.env.CONNECT_EMOJI,
		process.env.LINKED_EMOJI,
		process.env.REFUSED_EMOJI
	].includes(str);
}

export function isOwner(user: User | GuildMember): boolean {
	return process.env.OWNERS?.split(',').includes(user.id);
}

export function isStaff(member: GuildMember): boolean {
	return member.permissions.any([
		PermissionFlagsBits.ManageChannels,
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.ManageRoles,
		PermissionFlagsBits.ManageWebhooks,
		PermissionFlagsBits.BanMembers,
		PermissionFlagsBits.KickMembers,
		PermissionFlagsBits.Administrator,
		PermissionFlagsBits.DeafenMembers,
		PermissionFlagsBits.MuteMembers,
		PermissionFlagsBits.MoveMembers,
		PermissionFlagsBits.MentionEveryone,
		PermissionFlagsBits.ManageEmojisAndStickers,
		PermissionFlagsBits.ManageThreads,
		PermissionFlagsBits.ManageNicknames
	]);
}

export async function readFiles(dir): Promise<string[]> {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = resolve(dir, dirent.name);
		return dirent.isDirectory() ? readFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
}

// TODO: This should be on a different bot eventually
export async function onJoin(discordUserID: Snowflake, discordHandle: string, discordGuildID: Snowflake) {
	if (discordGuildID !== process.env.TRACKING_GUILD) return;

	const response = await fetch(`${process.env.API_ENDPOINT}/join`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.API_AUTH
		},
		body: JSON.stringify({
			discordUserID, discordGuildID, discordHandle
		})
	});

	if (!response.ok) throw Error(`Failed to join user ${discordUserID} in guild ${discordGuildID}: ${response.statusText}`);
}

export async function onConnect(
	searchDiscordUserID: Snowflake,
	searchDiscordHandle: string,
	discordUserID: Snowflake,
	discordHandle: string,
	discordGuildID: Snowflake,
	discordChannelID: Snowflake,
	path: string
) {
	if (discordGuildID !== process.env.TRACKING_GUILD) return;
	if (discordChannelID !== process.env.TRACKING_CHANNEL) return;

	const response = await fetch(`${process.env.API_ENDPOINT}/${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.API_AUTH
		},
		body: JSON.stringify({
			discordUserID,
			discordGuildID,
			discordHandle,
			searchDiscordUserID,
			searchDiscordHandle
		})
	});

	if (!response.ok) throw Error(`Failed to ${path} user ${discordUserID} in guild ${discordGuildID}: ${response.statusText}`);
}

export function checkConnected(discordUserID: Snowflake|Snowflake[], discordGuildID: Snowflake): Promise<any> {
	if (discordGuildID !== process.env.TRACKING_GUILD) return Promise.resolve(false);
	if (typeof discordUserID === 'string') {
		return fetch(`${process.env.API_ENDPOINT}/users/${discordUserID}`, { headers: { Authorization: process.env.API_AUTH } }).then((r) => (r.ok ? r.json() : null));
	}

	return fetch(`${process.env.API_ENDPOINT}/users`, {
		method: 'POST',
		body: JSON.stringify(discordUserID),
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.API_AUTH
		}
	}).then((r) => r.json());
}

export function trackingGuildChecks(interaction: CommandInteraction| ChatInputCommandInteraction) {
	if (!process.env.TRACKING_GUILD) {
		return Languages[interaction.language].Generics.MissingConfiguration('TRACKING_GUILD');
	}

	if (interaction.guild?.id !== process.env.TRACKING_GUILD) {
		return Languages[interaction.language].Permissions.TrackingServer(interaction.key);
	}

	return true;
}

export function isStateLead(interaction: CommandInteraction<'cached'> | ChatInputCommandInteraction<'cached'>) {
	if (!trackingGuildChecks(interaction)) return null;

	if (!REGION_ABBREVIATION_MAP[interaction.channel.name]) {
		return Languages[interaction.language].Permissions.WrongRegionChannel(interaction.channel, Object.keys(REGION_ABBREVIATION_MAP));
	}

	if (!interaction.member.roles.cache.some((r) => r.name === (REGION_ABBREVIATION_MAP[interaction.channel.name]))) {
		return Languages[interaction.language].Permissions.StateRegionMismatchChannel(REGION_ABBREVIATION_MAP[interaction.channel.name]);
	}

	return true;
}

export function hasSMERole(interaction: CommandInteraction<'cached'>) {
	if (!trackingGuildChecks(interaction)) return null;

	if (!process.env.SME_ROLE_IDS) {
		return Languages[interaction.language].Generics.MissingConfiguration('SME_ROLE_IDS');
	}

	if (!process.env.SME_ROLE_IDS.split(',').some((id) => interaction.member.roles.cache.has(id))) {
		return Languages[interaction.language].Permissions.MissingSMERole(process.env.SME_ROLE_IDS.split(','));
	}

	// TODO: Map roles to list of channels

	return true;
}

export async function renameOrganizing(channel: VoiceBasedChannel) {
	if (!channel.guild.members.me.permissions.has('ManageChannels')) return;

	if (VCChannelNames.has(channel.id) && !channel.members.size && channel.name !== VCChannelNames.get(channel.id)) {
		Logger.debug(`Renaming ${channel.name} (${channel.id}) to ${VCChannelNames.get(channel.id)}`);

		const auditReason = Languages[channel.guild.preferredLanguage].Commands.Lead.VC.Rename.AuditLogUndo();

		await channel.setName(VCChannelNames.get(channel.id), auditReason)
			.then(() => Logger.debug(`Successfully renamed ${channel.name} (${channel.id})`))
			.catch((err) => Logger.error(`Error renaming ${channel.name} (${channel.id})`, err));
	}
}
