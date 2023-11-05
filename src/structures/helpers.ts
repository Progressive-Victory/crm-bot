/* eslint-disable no-use-before-define */
import { t } from '@i18n';
import { StateAbbreviation } from '@util/state';
import {
	ChatInputCommandInteraction, CommandInteraction, GuildMember 
} from 'discord.js';
import { config } from 'dotenv';
import { states } from '../util/state/statesTypes';

config();

export function memberState(member: GuildMember) {
	return member.roles.cache.find((r) => states.has(r.name.toLocaleLowerCase() as StateAbbreviation));
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
