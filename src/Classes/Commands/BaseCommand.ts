import {
	ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction,
	InteractionCallbackResponse,
	Snowflake
} from 'discord.js';
import { ReturnableInteraction, SlashCommandBuilders } from './types.js';

/**
 * Slash command or context command
 */
export class BaseCommand<
	TypeBuilder extends SlashCommandBuilders | ContextMenuCommandBuilder,
	TypeInteraction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
> {
	// The constructor for the registration for the command
	protected _builder: TypeBuilder | undefined;

	protected _guildIds: Snowflake[];

	// Method that is run when command is executed
	protected _execute: ((interaction: TypeInteraction) => Promise<ReturnableInteraction | InteractionCallbackResponse>) | undefined;

	get name() {
		if(this._builder == undefined) throw Error('Builder is function is undefined');
		return this._builder.name;
	}

	get isGlobal() {
		return this._guildIds.length == 0;
	}

	get guildIds() {
		return this._guildIds;
	}
	set guildIds(ids: Snowflake[]) {
		this._guildIds = ids;
	}

	get builder() {
		if(this._builder == undefined) throw Error('builder is undefined');
		return this._builder;
	}

	set builder(builder: TypeBuilder) {
		this._builder = builder;
	}

	get execute() {
		if(this._execute == undefined) throw Error('execute function is undefined');
		return this._execute;
	}

	set execute(execute: (interaction: TypeInteraction) => Promise<ReturnableInteraction | InteractionCallbackResponse>) {
		this._execute = execute;
	}

	setGuildIds(... ids: Snowflake[]) {
		this._guildIds = ids;
		return this;
	}

	/**
	 * Set the execute method
	 * @param execute function passed in
	 * @returns The modified object
	 */
	setExecute(execute: (interaction: TypeInteraction) => Promise<ReturnableInteraction | InteractionCallbackResponse>): this {
		this.execute = execute;
		return this;
	}

	toJSON() {
		if(this._builder == undefined) throw Error('builder is undefined');
		return this._builder.toJSON();
	}

	constructor(options: Partial<BaseCommand<TypeBuilder, TypeInteraction>> = {}) {
		this._guildIds = options.guildIds ?? [];
		this._builder = options.builder;
		this._execute = options.execute;
	}
}
