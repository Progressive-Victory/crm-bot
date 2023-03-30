import {
	AutocompleteInteraction,
	CommandInteraction,
	UserContextMenuCommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	InteractionResponse,
	Message,
	Interaction
} from 'discord.js';
import Languages from '../assets/languages';
import { isOwner } from './helpers';

type ReturnableInteraction = CommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction
	| InteractionResponse<true>
	| Message<true>;

type Permissions = {
	member?: bigint[]
	client?: bigint[]
};

type CommandOptions = {
	name?: string;
	group?: string;
	perms?: Permissions
	ownersOnly?: boolean
	cooldown?: number
	guildOnly?: boolean
	execute: (interaction: CommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction,
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>,
}

export class Command {
	name?: string;

	group?: string;

	cooldown: number;

	ownersOnly: boolean;

	guildOnly: boolean;

	perms: Permissions;

	execute: (interaction: CommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction;

	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

	constructor(config: CommandOptions) {
		this.cooldown = config.cooldown || 3;
		this.ownersOnly = config.ownersOnly || false;
		this.perms = config.perms || {};
		this.name = config.name || '';
		this.group = config.group || '';
		this.execute = config.execute;
		this.autocomplete = config.autocomplete;
		this.guildOnly = config.guildOnly || false;
	}

	static async permissionsCheck(interaction: Interaction<'cached'>, command: Command) {
		let type = ''; let serverWideType = '';
		const clientMember = await interaction.guild.members.fetch(interaction.client.user);
		const perms = command.perms || {};

		if (command.ownersOnly && !isOwner(interaction.user)) {
			return {
				error: true,
				message: 'Only bot owners can use this command!'
			};
		}

		const clientMissingPermissionsServer = clientMember.permissions.missing(perms.client);
		const memberMissingPermissionsServer = interaction.member.permissions.missing(perms.member);

		if (clientMissingPermissionsServer.length) {
			serverWideType = 'client';
		}
		else if (memberMissingPermissionsServer.length) {
			serverWideType = 'member';
		}

		const clientMissingPermissions = interaction.channel.permissionsFor(clientMember).missing(perms.client);
		const memberMissingPermissions = interaction.channel.permissionsFor(interaction.member).missing(perms.member);

		if ('client' in perms && clientMissingPermissions.length) {
			type = 'client';
		}
		if (!isOwner(interaction.user) && 'member' in perms && memberMissingPermissions.length) {
			type = 'member';
		}
		if (!type) return true;

		const permissions = perms[type].map((perm) => {
			const name = perm.toString().replace(/_/g, ' ').toLowerCase().toTitleCase();
			return `\`${name}\``;
		}).join(', ');

		return {
			error: true,
			message: [
				Languages[interaction.language].Permissions.NoCommandPermissions(command.name, permissions, type),
				Languages[interaction.language].Permissions.NoCommandPermissions(command.name, permissions, type, serverWideType)
			].join('\n')
		};
	}

	toString() {
		return this.name;
	}
}

export type ContextMenuCommandOptions = {
	data: ContextMenuCommandBuilder;

	execute: (interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) => ReturnableInteraction | Promise<ReturnableInteraction>;
}

export class ContextMenuCommand {
	data: ContextMenuCommandBuilder;

	execute: (interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) => ReturnableInteraction | Promise<ReturnableInteraction>;

	constructor(options: ContextMenuCommandOptions) {
		this.data = options.data;
		this.execute = options.execute;
	}
}
