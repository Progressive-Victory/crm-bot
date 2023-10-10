import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';
import {
	ChatInputCommandBuilders, Mutable, ReturnableInteraction 
} from '../util';

/**
 * Slash command or context command
 */
export class Command<
	TypeBuilder extends ChatInputCommandBuilders | ContextMenuCommandBuilder,
	TypeInteraction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
> {
	// The constructor for the registration for the command
	readonly builder: TypeBuilder;

	// State if the command is available in all servers
	readonly isGlobal: boolean;

	// Method that is run when command is executed
	readonly execute: (interaction: TypeInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction;

	/**
	 *
	 * @param options
	 * @returns
	 */
	constructor(options: Partial<Command<TypeBuilder, TypeInteraction>> = {}) {
		this.isGlobal = options.isGlobal === undefined ? true : options.isGlobal;
		if (options.builder) this.builder = options.builder;
		if (options.execute) this.execute = options.execute;
	}

	/**
	 * Set the isGlobal Value
	 * @param isGlobal boolean vaule to be set
	 * @returns The modified object
	 */
	public setGlobal(isGlobal: boolean): this {
		(this as Mutable<Command<TypeBuilder, TypeInteraction>>).isGlobal = isGlobal;
		return this;
	}

	/**
	 * Set the execute method
	 * @param execute function passed in
	 * @returns The modified object
	 */
	public setExecute(execute: (interaction: TypeInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction): this {
		(this as Mutable<Command<TypeBuilder, TypeInteraction>>).execute = execute;
		return this;
	}
}

/**
 * Slash command
 */
export class ChatInputCommand extends Command<ChatInputCommandBuilders, ChatInputCommandInteraction> {
	/**
	 * Runs when client receives and Autocomplete interaction
	 * @param interaction Autocomplete interaction received by the client
	 */
	public autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

	constructor(options: Partial<ChatInputCommand> = {}) {
		super(options);
		if (options.autocomplete) this.autocomplete = options.autocomplete;
	}

	/**
	 * Set the command builder method
	 * @param input Slah command builder or callback
	 * @returns The modified object
	 */
	public setBuilder(input: SlashCommandBuilder | ((subcommandBuilder: SlashCommandBuilder) => ChatInputCommandBuilders)): this {
		if (typeof input === 'function') {
			(this as Mutable<ChatInputCommand>).builder = input(new SlashCommandBuilder());
		}
		else {
			(this as Mutable<ChatInputCommand>).builder = input;
		}
		return this;
	}

	/**
	 * Set Autocomplete method
	 * @param autocomplete autocomplete function
	 * @returns The modified object
	 */
	public setAutocomplete(autocomplete: (interaction: AutocompleteInteraction) => Promise<void>) {
		this.autocomplete = autocomplete;
		return this;
	}
}

export class ContextMenuCommand extends Command<ContextMenuCommandBuilder, ContextMenuCommandInteraction> {
	/**
	 * Set the Context Menu command builder method
	 * @param input Context Menu command builder or callback
	 * @returns The modified object
	 */
	public setBuilder(input: ContextMenuCommandBuilder | ((subcommandBuilder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder)): this {
		const mutableCommand = this as Mutable<ContextMenuCommand>;

		if (typeof input === 'function') {
			mutableCommand.builder = input(new ContextMenuCommandBuilder());
		}
		else {
			mutableCommand.builder = input;
		}
		return this;
	}
}
