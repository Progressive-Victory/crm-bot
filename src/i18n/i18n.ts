import {
	FluentBundle, FluentResource, FluentVariable 
} from '@fluent/bundle';
import {
	Collection, Locale, LocaleString 
} from 'discord.js';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const locales = Object.values(Locale);
export interface i18nOptions {
	hasGlobal?: boolean;
	fallback: Locale;
}

export class i18n {
	readonly fallback: Locale | LocaleString;

	private readonly path: string;

	private readonly global: FluentResource | undefined;

	private lang = new Collection<LocaleString, Collection<string, FluentBundle>>();

	readonly supportedLocale: LocaleString[] = [];

	constructor(path: string, options?: i18nOptions) {
		this.path = path;

		if (options) {
			this.fallback = options.fallback === undefined ? undefined : options.fallback;
			if (options.hasGlobal) {
				this.global = new FluentResource(readFileSync(join(path, 'global.ftl'), { encoding: 'utf-8' }));
			}
		}

		readdirSync(path)
			.filter((obj) => obj.split('.').length === 1 && locales.includes(obj as Locale))
			.forEach((dir: LocaleString) => {
				this.supportedLocale.push(dir);
				this.createLocaleCollection(dir);
			});
	}

	public t(key: string, locale: Locale | LocaleString, ns: string, args?: Record<string, FluentVariable>) {
		if (!this.lang.has(locale)) {
			if (locale !== this.fallback) return this.t(key, this.fallback, ns, args);
			return `{{${locale}}}`;
		}
		const local = this.lang.get(locale);
		if (!local.has(ns)) {
			if (ns !== 'comman') return this.t(key, locale, 'comman', args);
			return `{{${ns}}}`;
		}
		const bundle = local.get(ns);
		const msg = bundle.getMessage(key);
		if (!msg || !msg.value) {
			if (ns !== 'comman') return this.t(key, locale, 'comman', args);
			if (locale !== this.fallback) return this.t(key, this.fallback, ns, args);
			console.log(`[warning] i18n - Could not resolve key: ${key}`);
			return `{{${key}}}`;
		}
		const errors: Error[] = [];
		const res = bundle.formatPattern(msg.value, args, errors);
		if (errors.length) {
			console.warn(`[Error] i18n - Errors with ${key}`);
			console.log(args);
			console.error(errors);
		}

		return res;
	}

	/**
	 * Creates the collection of Collections for storing translations
	 * @param locale The locale of the collaction being generated
	 */
	private createLocaleCollection(locale: LocaleString) {
		const path = join(this.path, locale);
		const collection = new Collection<string, FluentBundle>();
		const files = readdirSync(path).filter((file) => file.endsWith('.ftl'));

		for (const file of files) {
			const bundle = new FluentBundle(locale);
			if (this.global) bundle.addResource(this.global);
			bundle.addResource(new FluentResource(readFileSync(join(path, file), { encoding: 'utf-8' })));
			collection.set(file.slice(0, -4), bundle);
		}
		this.lang.set(locale, collection);
	}
}
