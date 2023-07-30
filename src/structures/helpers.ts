/* eslint-disable no-use-before-define */
import { Logger } from '@Client';
import { t } from '@i18n';
import {
	ChatInputCommandInteraction, CommandInteraction, GuildMember, PermissionFlagsBits, Snowflake, User, VoiceBasedChannel 
} from 'discord.js';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { VCChannelNames } from './Constants';
import { StateAbbreviation, states } from './states';

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

export function memberState(member: GuildMember) {
	return member.roles.cache.find((r) => states.has(r.name.toLocaleLowerCase() as StateAbbreviation));
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkConnected(discordUserID: Snowflake | Snowflake[], discordGuildID: Snowflake): Promise<any> {
	if (discordGuildID !== process.env.TRACKING_GUILD) {
		return Promise.resolve(false);
	}
	if (typeof discordUserID === 'string') {
		const r = await fetch(`${process.env.API_ENDPOINT}/users/${discordUserID}`, { headers: { Authorization: process.env.API_AUTH } });
		return r.ok ? r.json() : null;
	}

	const r1 = await fetch(`${process.env.API_ENDPOINT}/users`, {
		method: 'POST',
		body: JSON.stringify(discordUserID),
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.API_AUTH
		}
	});
	return r1.json();
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
	const stateConfig = states.find((state) => state.name.toLowerCase().replace(' ', '-') === channel.name);
	if (!stateConfig) {
		return t({
			key: 'WrongRegionChannel',
			locale: interaction.locale,
			args: { channel: channel.toString() }
		});
	}

	if (!interaction.member.roles.cache.find((r) => r.name === stateConfig.abbreviation)) {
		return t({
			key: 'StateRegionMismatchChannel',
			locale: interaction.locale,
			args: { name: stateConfig.abbreviation }
		});
	}

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
