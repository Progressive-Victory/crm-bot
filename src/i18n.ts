import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';
import i18n from 'i18next';
import Fluent from 'i18next-fluent';
import FluentBackend from 'i18next-fluent-backend';
import { FluentVariable } from '@fluent/bundle';
import { LocaleString, Locale as dLocale } from 'discord.js';

const Locale = Object.values(dLocale);

const localesDirs = readdirSync(join(__dirname, '../locales')).filter((path) => Locale.includes(path as dLocale));

export default () => i18n
	.use(Fluent)
	.use(FluentBackend)
	.init({
		initImmediate: false,
		fallbackLng: dLocale.EnglishUS,
		preload: localesDirs.filter((fileName) => {
			const joinedPath = join(join(__dirname, '../locales'), fileName);
			const isDirectory = lstatSync(joinedPath).isDirectory();
			return isDirectory;
		}),
		ns: 'backend-app',
		defaultNS: 'backend-app',
		backend: { loadPath: join(__dirname, '../locales/{{lng}}/{{ns}}.ftl') }
	});

export function localize(key: string, options?: Record<string, FluentVariable>) {
	const res: Partial<Record<LocaleString, string>> = {};
	localesDirs.forEach((locale) => {
		options.lng = locale;
		res[locale] = i18n.t(key, options);
	});

	return res;
}
