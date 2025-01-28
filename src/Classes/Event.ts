/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientEvents as DiscordClientEvents } from 'discord.js';

/**
 * Event Class
 */
export class Event<K extends keyof DiscordClientEvents> {
	// Name of the Event
	private _name?: K;

	// Flag if the event should only run once
	private _once: boolean;

	// Method to be run when the event occurs
	private _execute?: (...args: DiscordClientEvents[K]) => void;

	get name() {
		if(this._name == undefined) throw Error('Name of event not set');
		return this._name;
	}

	get once() {
		return this._once;
	}

	get execute() {
		if(this._execute == undefined) throw Error('execute function of event not set');
		return this._execute;
	}

	constructor(options: Partial<Event<K>> = {}) {
		this._name = options.name;
		this._once = options.once ?? false;
		this._execute = options.execute;
	}

	/**
	 * Set the once flag
	 * @param input value to set
	 * @returns The modified object
	 */
	public setOnce(input: boolean) {
		this._once = input;
		return this;
	}

	/**
	 * Set the name of the event
	 * @param input value to set
	 * @returns The modified object
	 */
	public setName(input: K) {
		this._name = input;
		return this;
	}

	/**
	 * Set the execute method
	 * @param execute function passed in
	 * @returns The modified object
	 */
	public setExecute(execute: (...args: DiscordClientEvents[K]) => void) {
		this._execute = execute;
		return this;
	}
}

export default Event;
