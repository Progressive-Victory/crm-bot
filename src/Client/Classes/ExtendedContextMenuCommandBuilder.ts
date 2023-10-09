import {
	ContextMenuCommandBuilder, Locale, LocaleString 
} from 'discord.js';

export class ExtendedContextMenuCommandBuilder extends ContextMenuCommandBuilder {
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
