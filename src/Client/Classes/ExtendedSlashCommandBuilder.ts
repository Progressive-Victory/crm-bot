import {
	Collection,
	Locale,
	LocaleString,
	SharedSlashCommandOptions,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from 'discord.js';

export class ExtendedSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	private helpTitle: Partial<Record<LocaleString, string>> = {};

	private helpDescription: Partial<Record<LocaleString, string>> = {};

	public setHelpTitleLocalizations(localizedTitle: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedTitle);
		return this;
	}

	public setHelpDescriptionLocalizations(localizedDescriptions: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedDescriptions);
		return this;
	}

	public getHelpInfo(locale: Locale): { title: string; description: string } {
		return { title: this.helpTitle[locale.toString()], description: this.helpDescription[locale.toString()] };
	}
}

export class ExtendedSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	private subcommandBuilders = new Collection<string, ExtendedSlashCommandSubcommandBuilder>();

	public addSubcommand(
		input: ExtendedSlashCommandSubcommandBuilder | ((subcommandGroup: ExtendedSlashCommandSubcommandBuilder) => ExtendedSlashCommandSubcommandBuilder)
	): this {
		const command = typeof input === 'function' ? input(new ExtendedSlashCommandSubcommandBuilder()) : input;

		this.subcommandBuilders.set(command.name, command);

		return super.addSubcommand(input);
	}

	private helpTitle: Partial<Record<LocaleString, string>> = {};

	private helpDescription: Partial<Record<LocaleString, string>> = {};

	public setHelpTitleLocalizations(localizedTitle: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedTitle);
		return this;
	}

	public setHelpDescriptionLocalizations(localizedDescriptions: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedDescriptions);
		return this;
	}

	public getHelpInfo(locale: Locale): { title: string; description: string } {
		return { title: this.helpTitle[locale.toString()], description: this.helpDescription[locale.toString()] };
	}
}

export class ExtendedSlashCommandBuilder extends SlashCommandBuilder {
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

	private helpTitle: Partial<Record<LocaleString, string>> = {};

	private helpDescription: Partial<Record<LocaleString, string>> = {};

	public setHelpTitleLocalizations(localizedTitle: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedTitle);
		return this;
	}

	public setHelpDescriptionLocalizations(localizedDescriptions: Partial<Record<LocaleString, string>>) {
		Object.assign(this.helpTitle, localizedDescriptions);
		return this;
	}

	public getHelpInfo(locale: Locale): { title: string; description: string } {
		return { title: this.helpTitle[locale.toString()], description: this.helpDescription[locale.toString()] };
	}
}
