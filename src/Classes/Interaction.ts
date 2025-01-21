import { Interaction as DiscordInteraction } from 'discord.js';

/**
 * Interaction object
 */
export class Interaction<E extends DiscordInteraction> {
    
	// Name of Interaction
	private _customIdPrefix: string | undefined;

	// Method that to run when interaction happens
	private _run: ((interaction: E) => Promise<void>) | undefined;

	get customIdPrefix() {
		if( this._customIdPrefix == undefined) throw Error('prefix for interaction is undefined');
		return this._customIdPrefix;
	}

	// eslint-disable-next-line jsdoc/require-returns
	/**
	 * @deprecated Use `customId`
	 */
	get name() {
		if( this._customIdPrefix == undefined) throw Error('prefix for interaction is undefined');
		return this._customIdPrefix;
	}

	// eslint-disable-next-line jsdoc/require-returns
	/**
	 * @deprecated Use `run`
	 */
	get execute() {
		if( this._run == undefined) throw Error('run function is undefined');
		return this._run;
	}

	get run() {
		if( this._run == undefined) throw Error('run function is undefined');
		return this._run;
	}

	constructor(options: Partial<Interaction<E>> = {}) {
		if (options.customIdPrefix) this._customIdPrefix = options.customIdPrefix ?? undefined;
		if (options.run) this._run = options.run ?? undefined;
	}

	/**
	 * Set the name of the interaction
	 * @deprecated Use `setCustomId`
	 * @param name Name of interaction
	 * @returns The modified object
	 */
	public setName(name: string) {
		this._customIdPrefix = name;
		return this;
	}

	/**
	 * Set the name of the interaction
	 * @param customId Name of interaction
	 * @returns The modified object
	 */
	public setCustomIdPrefix(customId: string) {
		this._customIdPrefix = customId;
		return this;
	}

	/**
	 * Set the execute method
	 * @deprecated Use `setRun`
	 * @param execute function passed in
	 * @returns The modified object
	 */
	public setExecute(execute: (interaction: E) => Promise<void>) {
		this._run = execute;
		return this;
	}

	/**
	 * Set the execute method
	 * @param run function passed in
	 * @returns The modified object
	 */
	public setRun(run: (interaction: E) => Promise<void>) {
		this._run = run;
		return this;
	}
}
