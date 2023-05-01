import {
	SlashCommandBuilder, ContextMenuCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, ContextMenuCommandInteraction,
	CommandInteraction,
	SlashCommandSubcommandsOnlyBuilder,
	InteractionResponse,
	Message,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction
} from 'discord.js';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
type ReturnableInteraction = CommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction
	| InteractionResponse
	| Message;

export type ChatInputCommandBuilders = SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>

export interface CommandOptions{
    builder: ChatInputCommandBuilders | ContextMenuCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction,
}

export class ChatInputCommand implements CommandOptions {
	readonly builder: ChatInputCommandBuilders;

	public execute: (interaction: ChatInputCommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction;

	public autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

	constructor()

	constructor(options?: Partial<ChatInputCommand>) {
		if (options) {
			if (options.builder) this.builder = options.builder;
			if (options.execute) this.execute = options.execute;
			this.autocomplete = options.autocomplete;
		}
	}

	public setBuilder(input: SlashCommandBuilder | ((subcommandBuilder: SlashCommandBuilder) => ChatInputCommandBuilders)): this {
		if (typeof input === 'function') {
			(this as Mutable<ChatInputCommand>).builder = input(new SlashCommandBuilder());
		}
		else {
			(this as Mutable<ChatInputCommand>).builder = input;
		}
		return this;
	}

	public setExecute(execute:((interaction: ChatInputCommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction)) {
		this.execute = execute;
		return this;
	}

	public setAutocomplete(autocomplete:((interaction: AutocompleteInteraction) => Promise<void>)) {
		this.autocomplete = autocomplete;
		return this;
	}
}

export class ContextMenuCommand implements CommandOptions {
	readonly builder: ContextMenuCommandBuilder;

	public execute: (interaction: ContextMenuCommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction;

	constructor()

	constructor(options?: Partial<ContextMenuCommand>) {
		if (options) {
			if (options.builder) this.builder = options.builder;
			if (options.execute) this.execute = options.execute;
		}
	}

	public setBuilder(input: ContextMenuCommandBuilder | ((subcommandBuilder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder)): this {
		if (typeof input === 'function') {
			(this as Mutable<ContextMenuCommand>).builder = input(new ContextMenuCommandBuilder());
		}
		else {
			(this as Mutable<ContextMenuCommand>).builder = input;
		}
		return this;
	}

	public setExecute(execute:((interaction: ContextMenuCommandInteraction) => Promise<ReturnableInteraction> | ReturnableInteraction)) {
		this.execute = execute;
		return this;
	}
}

export default {
	ContextMenuCommand,
	ChatInputCommand
};
