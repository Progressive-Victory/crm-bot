import {
	ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction,
	Snowflake
} from 'discord.js';
import { AnySlashCommandBuilder } from './types.js';

export class BaseCommand<
    TypeBuilder extends AnySlashCommandBuilder | ContextMenuCommandBuilder,
    TypeInteraction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
> {
    // The constructor for the registration for the command
    protected _builder?: TypeBuilder;

    protected _guildIds: Snowflake[];

    // Method that is run when command is executed
    protected _execute?: (interaction: TypeInteraction) => void;

    get name() {
        return this.builder.name;
    }

    get isGlobal() {
        return this._guildIds.length == 0;
    }

    get guildIds() {
        return this._guildIds;
    }

    get builder() {
        if(this._builder === undefined) throw Error('Command builder is undefined')
        return this._builder;
    }

    get execute() {
        if(this._execute === undefined) throw Error('Command execute is undefined')
        return this._execute;
    }

    setGuildIds(...ids: Snowflake[]) {
        this._guildIds = ids;
        return this;
    }

    /**
     * Set the execute method
     * @param execute function passed in
     * @returns The modified object
     */
    setExecute(execute: (interaction: TypeInteraction) => void): this {
        this._execute = execute;
        return this;
    }

    /**
     * This method runs validations on the data before serializing it. As such, it may throw an error if the data is invalid.
     * @returns Serializes to API-compatible JSON data.
     */
    toJSON() {
        return this.builder.toJSON();
    }

    /**
     * Represents Slash command or context command
     * @param options partial object 
     */
    constructor(options?: Partial<BaseCommand<TypeBuilder, TypeInteraction>>) {
        this._guildIds = options?.guildIds ?? [];
        this._builder = options?.builder;
        this._execute = options?.execute;
    }
}
