import {
	CommandInteraction,
	UserContextMenuCommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	InteractionResponse,
	Message
} from 'discord.js';
import { isOwner } from './helpers';

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
	execute: (interaction: CommandInteraction) => Promise<InteractionResponse>;
}

export class Command {
	name?: string;

	group?: string;

	cooldown: number;

	ownersOnly: boolean;

	perms: Permissions;

	execute: (interaction: CommandInteraction) => Promise<InteractionResponse>;

	constructor(config: CommandOptions) {
		this.cooldown = config.cooldown || 3;
		this.ownersOnly = config.ownersOnly || false;
		this.perms = config.perms || {};
		this.name = config.name || '';
		this.group = config.group || '';
		this.execute = config.execute;
	}

	static async permissionsCheck(interaction: CommandInteraction<'cached'>, command: Command) {
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
		let permissions: string;

		if ('client' in perms && clientMissingPermissions.length) {
			type = 'client';
			permissions = clientMissingPermissions.map((p) => `\`${p}\``).join(', ');
		}
		if (!isOwner(interaction.user) && 'member' in perms && memberMissingPermissions.length) {
			type = 'member';
			permissions = memberMissingPermissions.map((p) => `\`${p}\``).join(', ');
		}
		if (!type) return true;

		let str: string;

		if (serverWideType) {
			str = `${type === 'client' ? 'I' : 'You'} need the following **${serverWideType === type ? 'server-wide' : 'channel-wide'}** permissions: ${permissions} to execute the command \`${command}\`!`;
		}
		if (type) {
			str = `${type === 'client' ? 'I' : 'You'} don't have enough permissions: ${permissions} to execute the command \`${command}\`!`;
		}
		else str = `You do not have permissions to execute the command \`${command}\`.`;

		return {
			error: true,
			message: str
		};
	}

	toString() {
		return this.name;
	}
}

type ReturnableInteraction = CommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction
	| InteractionResponse<true>
	| Message<true>;

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
