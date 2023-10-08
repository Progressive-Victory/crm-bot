import {
	Collection,
	EmbedBuilder,
	Locale,
	SharedSlashCommandOptions,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from 'discord.js';

export class ExtendedSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	public getHelpEmbed: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder;

	public setHelpEmbed(input: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder) {
		this.getHelpEmbed = input;
		return this;
	}
}

export class ExtendedSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public getHelpEmbed: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder;

	private subcommandBuilders = new Collection<string, ExtendedSlashCommandSubcommandBuilder>();

	public addSubcommand(
		input: ExtendedSlashCommandSubcommandBuilder | ((subcommandGroup: ExtendedSlashCommandSubcommandBuilder) => ExtendedSlashCommandSubcommandBuilder)
	): this {
		const command = typeof input === 'function' ? input(new ExtendedSlashCommandSubcommandBuilder()) : input;

		this.subcommandBuilders.set(command.name, command);

		return super.addSubcommand(input);
	}

	public setHelpEmbed(input: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder) {
		this.getHelpEmbed = input;
		return this;
	}
}

export class ExtendedSlashCommandBuilder extends SlashCommandBuilder {
	public getHelpEmbed: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder;

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

	public setHelpEmbed(input: (locale: Locale, baseEmbed: EmbedBuilder) => EmbedBuilder) {
		this.getHelpEmbed = input;
		return this;
	}
}
