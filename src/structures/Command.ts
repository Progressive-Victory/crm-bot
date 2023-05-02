import {
	AutocompleteInteraction,
	CommandInteraction,
	UserContextMenuCommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	InteractionResponse,
	Message,
	Interaction,
	PermissionResolvable
} from 'discord.js';
import Languages from '../assets/languages';
import { isOwner } from './helpers';

type ReturnableInteraction =
	| CommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction
	| InteractionResponse<true>
	| Message<true>;

type Permissions = {
	member?: PermissionResolvable[];
	client?: PermissionResolvable[];
};

interface CommandOptions {
	name: string;
	group?: string;
	perms?: Permissions;
	ownersOnly?: boolean;
	cooldown?: number;
	guildOnly?: boolean;
	execute: (
		interaction: CommandInteraction
	) => Promise<ReturnableInteraction> | ReturnableInteraction;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

abstract class BaseCommand {
	name?: string;

	perms?: Permissions;

	ownersOnly: boolean;

	guildOnly: boolean;

	execute: (
		interaction: CommandInteraction
	) => Promise<ReturnableInteraction> | ReturnableInteraction;

	constructor(config: CommandOptions) {
		this.name = config.name;
		this.perms = config.perms || {};
		this.ownersOnly = config.ownersOnly || false;
		this.guildOnly = config.guildOnly || false;
		this.execute = config.execute;
	}

	static async permissionsCheck(
		interaction: Interaction<'cached'>,
		command: BaseCommand
	) {
		let type = '';
		let serverWideType = '';
		const clientMember = await interaction.guild.members.fetch(
			interaction.client.user
		);
		const perms = command.perms || {};

		if (command.ownersOnly && !isOwner(interaction.user)) {
			return {
				error: true,
				message: Languages[interaction.language].Permissions.BotOwners(
					command.name
				)
			};
		}

		if (command.guildOnly && !interaction.guildId) {
			return {
				error: true,
				message: Languages[interaction.language].Permissions.ServerOnly(
					command.name
				)
			};
		}

		const clientMissingPermissionsServer = clientMember.permissions.missing(
			perms.client
		);
		const memberMissingPermissionsServer =
			interaction.member.permissions.missing(perms.member);

		if (clientMissingPermissionsServer.length) {
			serverWideType = 'client';
		}
		else if (memberMissingPermissionsServer.length) {
			serverWideType = 'member';
		}

		const clientMissingPermissions = interaction.channel
			.permissionsFor(clientMember)
			.missing(perms.client);
		const memberMissingPermissions = interaction.channel
			.permissionsFor(interaction.member)
			.missing(perms.member);

		if ('client' in perms && clientMissingPermissions.length) {
			type = 'client';
		}
		if (
			!isOwner(interaction.user) &&
			'member' in perms &&
			memberMissingPermissions.length
		) {
			type = 'member';
		}
		if (!type) return true;

		const permissions = perms[type]
			.map((perm: string) => `\`${perm.replace(/_/g, ' ')}\``)
			.join(', ');

		return {
			error: true,
			message: [
				Languages[
					interaction.language
				].Permissions.NoCommandPermissions(
					command.name,
					permissions,
					type
				),
				Languages[
					interaction.language
				].Permissions.NoCommandPermissions(
					command.name,
					permissions,
					type,
					serverWideType
				)
			].join('\n')
		};
	}

	toString() {
		return this.name;
	}
}

export class Command extends BaseCommand {
	group?: string;

	cooldown: number;

	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

	constructor(config: CommandOptions) {
		super(config);
		this.cooldown = config.cooldown || 3;
		this.group = config.group || '';
		this.autocomplete = config.autocomplete;
	}
}

interface ContextMenuCommandOptions extends CommandOptions {
	data: ContextMenuCommandBuilder;

	execute: (
		interaction:
			| UserContextMenuCommandInteraction
			| MessageContextMenuCommandInteraction
	) => ReturnableInteraction | Promise<ReturnableInteraction>;
}

export class ContextMenuCommand extends BaseCommand {
	data: ContextMenuCommandBuilder;

	declare execute: (
		interaction:
			| UserContextMenuCommandInteraction
			| MessageContextMenuCommandInteraction
	) => ReturnableInteraction | Promise<ReturnableInteraction>;

	constructor(options: ContextMenuCommandOptions) {
		super(options);
		this.data = options.data;
		this.execute = options.execute;
	}
}
