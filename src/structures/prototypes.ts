import { BaseInteraction, Guild } from 'discord.js';
import { DefaultLanguage, localeToLanguage } from '../assets/languages';

export default () => {
	Object.defineProperty(Date.prototype, 'discordTimestamp', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:t>`;
		}
	});

	Object.defineProperty(Date.prototype, 'discordDuration', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:R>`;
		}
	});

	Object.defineProperty(Date.prototype, 'discordDay', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:d>`;
		}
	});

	Object.defineProperty(BaseInteraction.prototype, 'language', {
		get: function get(this: BaseInteraction) {
			return localeToLanguage[this.locale] ?? DefaultLanguage;
		}
	});

	Object.defineProperty(Guild.prototype, 'preferredLanguage', {
		get: function get(this: Guild) {
			return localeToLanguage[this.preferredLocale] ?? DefaultLanguage;
		}
	});
};
