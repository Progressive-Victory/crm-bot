/* eslint-disable no-use-before-define */
import { t } from '@i18n';
import { StateAbbreviation } from '@util/state';
import {
	ChatInputCommandInteraction, CommandInteraction, GuildMember, PermissionFlagsBits, User 
} from 'discord.js';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { states } from './states';

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
