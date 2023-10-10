import { Locale, LocaleString } from 'discord.js';

type LocalizedHelpInfo = Partial<Record<LocaleString, string>>;

interface HelpInfoProperties {
	helpTitle: LocalizedHelpInfo;
	helpDescription: LocalizedHelpInfo;
	setHelpTitleLocalizations(localizedTitle: LocalizedHelpInfo): this;
	setHelpDescriptionLocalizations(localizedDescriptions: LocalizedHelpInfo): this;
	getHelpInfo(locale: Locale): { title: string; description: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Mixin = <T extends new (...args: any[]) => object>(Base: T) =>
	class extends Base implements HelpInfoProperties {
		helpTitle: LocalizedHelpInfo = {};

		helpDescription: LocalizedHelpInfo = {};

		setHelpTitleLocalizations(localizedTitle: LocalizedHelpInfo) {
			Object.assign(this.helpTitle, localizedTitle);
			return this;
		}

		setHelpDescriptionLocalizations(localizedDescriptions: LocalizedHelpInfo) {
			Object.assign(this.helpDescription, localizedDescriptions);
			return this;
		}

		getHelpInfo(locale: Locale): { title: string; description: string } {
			return {
				title: this.helpTitle[locale.toString()],
				description: this.helpDescription[locale.toString()]
			};
		}
	};
