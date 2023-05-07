import { FluentVariable } from '@fluent/bundle';
import { Locale, LocaleString } from 'discord.js';
import { i18n as Client, i18nOptions } from './i18n';

let i18n: Client;

export function init(path: string, options?: i18nOptions) {
	i18n = new Client(path, options);
	return i18n;
}

export function t(key: string, locale: Locale | LocaleString, ns: string, args?: Record<string, FluentVariable>) {
	return i18n.t(key, locale, ns, args);
}
export function localization(key: string, ns: string, options?: Record<string, FluentVariable>): Partial<Record<LocaleString, string>> {
	const res: Partial<Record<LocaleString, string>> = {};
	i18n.supportedLocale.forEach((locale) => {
		res[locale] = i18n.t(key, locale, ns, options);
	});
	return res;
}

export default {
	init,
	t,
	localization
};
