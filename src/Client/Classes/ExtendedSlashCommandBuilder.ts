import {
	Collection,
	ContextMenuCommandBuilder,
	SharedSlashCommandOptions,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from 'discord.js';

import { Mixin } from './Mixin';

export class ExtendedContextMenuCommandBuilder extends Mixin(ContextMenuCommandBuilder) {}

export class ExtendedSlashCommandSubcommandBuilder extends Mixin(SlashCommandSubcommandBuilder) {}

export class ExtendedSlashCommandSubcommandGroupBuilder extends Mixin(SlashCommandSubcommandGroupBuilder) {
	private subcommandBuilders = new Collection<string, ExtendedSlashCommandSubcommandBuilder>();

	public addSubcommand(
		input: ExtendedSlashCommandSubcommandBuilder | ((subcommandGroup: ExtendedSlashCommandSubcommandBuilder) => ExtendedSlashCommandSubcommandBuilder)
	): this {
		const command = typeof input === 'function' ? input(new ExtendedSlashCommandSubcommandBuilder()) : input;

		this.subcommandBuilders.set(command.name, command);

		return super.addSubcommand(input);
	}
}

export class ExtendedSlashCommandBuilder extends Mixin(SlashCommandBuilder) {
	private subcommandGroupBuilders = new Collection<string, ExtendedSlashCommandSubcommandGroupBuilder>();

	private subcommandBuilders = new Collection<string, ExtendedSlashCommandSubcommandBuilder>();

	public addSubcommandGroup(
		input:
			| ExtendedSlashCommandSubcommandGroupBuilder
			| ((subcommandGroup: ExtendedSlashCommandSubcommandGroupBuilder) => ExtendedSlashCommandSubcommandGroupBuilder)
	): Omit<ExtendedSlashCommandBuilder, Exclude<keyof SharedSlashCommandOptions, 'options'>> {
		const group = typeof input === 'function' ? input(new ExtendedSlashCommandSubcommandGroupBuilder()) : input;
		this.subcommandGroupBuilders.set(group.name, group);

		return super.addSubcommandGroup(input) as Omit<ExtendedSlashCommandBuilder, Exclude<keyof SharedSlashCommandOptions, 'options'>>;
	}

	public addSubcommand(
		input: ExtendedSlashCommandSubcommandBuilder | ((subcommandGroup: ExtendedSlashCommandSubcommandBuilder) => ExtendedSlashCommandSubcommandBuilder)
	): Omit<ExtendedSlashCommandBuilder, Exclude<keyof SharedSlashCommandOptions, 'options'>> {
		const command = typeof input === 'function' ? input(new ExtendedSlashCommandSubcommandBuilder()) : input;

		this.subcommandBuilders.set(command.name, command);

		return super.addSubcommand(input) as Omit<ExtendedSlashCommandBuilder, Exclude<keyof SharedSlashCommandOptions, 'options'>>;
	}
}
