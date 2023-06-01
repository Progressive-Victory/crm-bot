import { readdir } from 'fs/promises';
import { resolve } from 'path';

import {
	ChatInputCommandInteraction, CommandInteraction, GuildMember, PermissionFlagsBits, Snowflake, User, VoiceBasedChannel 
} from 'discord.js';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { REGION_ABBREVIATION_MAP, VCChannelNames } from './Constants';
import Logger from './Logger';
import { State } from '../declarations/states';
import { t } from '../i18n';

config();

// TypeScript or JavaScript environment (thanks to https://github.com/stijnvdkolk)
// eslint-disable-next-line import/no-mutable-exports
export let tsNodeRun = false;
try {
	// @ts-ignore
	if (process[Symbol.for('ts-node.register.instance')]) {
		tsNodeRun = true;
	}
}
catch (e) {
	/* empty */
}

export async function reRequire(path: string) {
	delete require.cache[require.resolve(path)];
	const result = await require(path);
	return result;
}

export function isConnectEmoji(str: string) {
	return [process.env.VERIFY_EMOJI, process.env.CONNECT_EMOJI, process.env.LINKED_EMOJI, process.env.REFUSED_EMOJI].includes(str);
}

export function isOwner(user: User | GuildMember): boolean {
	return process.env.OWNERS?.split(',').includes(user.id);
}

export const states = Object.values(State);

export function memberState(member: GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
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
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = resolve(dir, dirent.name);
			return dirent.isDirectory() ? readFiles(res) : res;
		})
	);
	return Array.prototype.concat(...files);
}

export async function onJoin(discordUserID: Snowflake, discordHandle: string, discordGuildID: Snowflake) {
	if (discordGuildID !== process.env.TRACKING_GUILD) return;

	const response = await fetch(`${process.env.API_ENDPOINT}/join`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.API_AUTH
		},
		body: JSON.stringify({
			discordUserID,
			discordGuildID,
			discordHandle
		})
	});

	if (!response.ok) {
		throw Error(`Failed to join user ${discordUserID} in guild ${discordGuildID}: ${response.statusText}`);
	}
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

	if (!response.ok) {
		throw Error(`Failed to ${path} user ${discordUserID} in guild ${discordGuildID}: ${response.statusText}`);
	}
}

export function checkConnected(discordUserID: Snowflake | Snowflake[], discordGuildID: Snowflake): Promise<any> {
	if (discordGuildID !== process.env.TRACKING_GUILD) {
		return Promise.resolve(false);
	}
	if (typeof discordUserID === 'string') {
		return fetch(`${process.env.API_ENDPOINT}/users/${discordUserID}`, { headers: { Authorization: process.env.API_AUTH } }).then((r) =>
			r.ok ? r.json() : null
		);
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

export function trackingGuildChecks(interaction: CommandInteraction | ChatInputCommandInteraction) {
	if (!process.env.TRACKING_GUILD) {
		return t({
			key: 'MissingConfiguration',
			locale: interaction.locale,
			args: { name: 'TRACKING_GUILD' }
		});
	}

	if (interaction.guild?.id !== process.env.TRACKING_GUILD) {
		return t({
			key: 'TrackingServer',
			locale: interaction.locale,
			args: { command: interaction.commandName }
		});
	}

	return true;
}

export function isStateLead(interaction: CommandInteraction<'cached'> | ChatInputCommandInteraction<'cached'>) {
	if (!trackingGuildChecks(interaction)) return null;

	const channel = interaction.channel.isThread() ? interaction.channel.parent : interaction.channel;
	if (!REGION_ABBREVIATION_MAP[channel.name]) {
		return t({
			key: 'WrongRegionChannel',
			locale: interaction.locale,
			args: { channel: channel.toString() }
		});
	}

	if (!interaction.member.roles.cache.some((r) => r.name === REGION_ABBREVIATION_MAP[channel.name])) {
		return t({
			key: 'StateRegionMismatchChannel',
			locale: interaction.locale,
			args: { name: REGION_ABBREVIATION_MAP[channel.name] }
		});
	}

	return true;
}

export function hasSMERole(interaction: CommandInteraction<'cached'>) {
	if (!trackingGuildChecks(interaction)) return null;
	const roleIDs = process.env.SME_ROLE_IDS;
	if (!roleIDs) {
		return t({
			key: 'MissingConfiguration',
			locale: interaction.locale,
			args: { name: 'SME_ROLE_IDS' }
		});
	}

	if (!roleIDs.split(',').some((id) => interaction.member.roles.cache.has(id))) {
		return t({
			key: 'MissingSMERole',
			locale: interaction.locale,
			args: {
				roles: `${roleIDs
					.split(',')
					.map((id) => `<@&${id}>`)
					.join(', ')}`
			}
		});
	}

	// TODO: Map roles to list of channels

	return true;
}

export async function renameOrganizing(channel: VoiceBasedChannel) {
	if (!channel.guild.members.me.permissions.has('ManageChannels')) return;

	if (VCChannelNames.has(channel.id) && !channel.members.size && channel.name !== VCChannelNames.get(channel.id)) {
		Logger.debug(`Renaming ${channel.name} (${channel.id}) to ${VCChannelNames.get(channel.id)}`);

		const auditReason = t({
			key: 'vc-rename-error',
			locale: channel.guild.preferredLocale,
			ns: 'lead',
			args: { channel: channel.name }
		});

		await channel
			.setName(VCChannelNames.get(channel.id), auditReason)
			.then(() => Logger.debug(`Successfully renamed ${channel.name} (${channel.id})`))
			.catch((err) => Logger.error(`Error renaming ${channel.name} (${channel.id})`, err));
	}
}

/**
 * Returns a boolean and Types a unknown as ErrnoException if the object is an error
 * @param error Any unknown object
 * @returns A boolean value if the the object is a ErrnoException
 */
// eslint-disable-next-line no-undef
export function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error;
}
