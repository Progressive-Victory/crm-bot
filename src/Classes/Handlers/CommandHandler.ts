import {
	ApplicationCommandDataResolvable,
	ApplicationCommandType,
	AutocompleteInteraction, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction,
	Events,
	Routes,
	Snowflake
} from 'discord.js';
import { Client } from '../Client/index.js';
import { ChatInputCommand, ContextMenuCommand } from '../Commands/index.js';


export class CommandHandler {

    // Parent client of the handler
    readonly client: Client;

    // Slash commands in the handler
    protected _chatCommands = new Collection<string, ChatInputCommand>();

    // User context commands in the handler
    protected _userContextMenus = new Collection<string, ContextMenuCommand>();

    // Message context commands in the handler
    protected _messageContextMenus = new Collection<string, ContextMenuCommand>();

    get userContextMenus() {
        return this._userContextMenus;
    }

    get chatCommands() {
        return this._chatCommands;
    }

    get rest() {
        return this.client.rest;
    }

    /**
     * Add command to command handler
     * @param command Command to add
     * @returns the command handler
     */
    add(command: ChatInputCommand | ContextMenuCommand) {
        const { type, name } = command;
		
        switch (type) {
            case ApplicationCommandType.ChatInput:
                this._chatCommands.set(name, command);
                break;
            case ApplicationCommandType.Message:
                this._messageContextMenus.set(name, command as ContextMenuCommand);
                break;
            case ApplicationCommandType.User:
                this._userContextMenus.set(name, command as ContextMenuCommand);
                break;
            default:
                break;
        }
        return this;
    }

    /**
     * Add a collection of chat commands to the handler
     * @param commands Collections of chat commands
     * @returns The command handler
     */
    addChatCommands(commands: Collection<string, ChatInputCommand>) {
        for (const [ name, command ] of commands) {
            this._chatCommands.set(name, command);
        }
        return this;
    }

    /**
     * Add a collection of user context commands to the handler
     * @param commands Collections of user context commands
     * @returns The command handler
     */
    addUserContextMenus(commands: Collection<string, ContextMenuCommand>) {
        for (const [ name, command ] of commands) {
            this._userContextMenus.set(name, command);
        }
        return this;
    }

    /**
     * Add a collection of message context commands to the handler
     * @param commands Collections of message context commands
     * @returns the command handler
     */
    addMessageContextMenus(commands: Collection<string, ContextMenuCommand>) {
        for (const [ name, command ] of commands) {
            this._messageContextMenus.set(name, command);
        }
        return this;
    }

    /**
     * Deploy Application Commands to Discord
     * @see https://discord.com/developers/docs/interactions/application-commands
     */
    async register() {
        if (!this.client.loggedIn) throw Error('Client cannot register commands before init');

        this.client.emit(Events.Debug, 'Deploying commands...');
        const globalCommandData: ApplicationCommandDataResolvable[] = this.chatCommands.filter((f) => f.isGlobal)
            .map((m) => m.toJSON())
            .concat(this._userContextMenus.filter((f) => f.isGlobal)
                .map((m) => m.toJSON()))
            .concat(this._messageContextMenus.filter((f) => f.isGlobal)
                .map((m) => m.toJSON()));
        const sentCommands = await this.client.application.commands.set(globalCommandData);
        this.client.emit(Events.Debug, `Deployed ${sentCommands.size.toString()} global command(s)`);
        
        const guildCommandData = new Collection<Snowflake,ApplicationCommandDataResolvable[]>();
        // Get guild chat commands
        this.chatCommands.filter((f) => !f.isGlobal).map((m) => {
            const json = m.toJSON();
            m.guildIds.forEach((guildId) => {
                if (guildCommandData.has(guildId)) {
                    guildCommandData.get(guildId)?.concat(json);
                }
                
                else {
                    guildCommandData.set(guildId, [json]);
                }
                
            });

        });
        // Get guild context
        this._userContextMenus.filter((f) => !f.isGlobal).map((m) => {
            const json = m.toJSON();
            m.guildIds.forEach((guildId) => {
                if (guildCommandData.has(guildId)) {
                    guildCommandData.get(guildId)?.concat(json);
                }
                
                else {
                    guildCommandData.set(guildId, [json]);
                }
                
            });
        });

        this._messageContextMenus.filter((f) => !f.isGlobal).map((m) => {
            const json = m.toJSON();
            m.guildIds.forEach((guildId) => {
                if (guildCommandData.has(guildId)) {
                    guildCommandData.get(guildId)?.concat(json);
                }
                
                else {
                    guildCommandData.set(guildId, [json]);
                }
                
            });
        });
        // Deploys commands buy guild
        for (const [ guildIds, json ] of guildCommandData) {
            await this.client.application.commands.set(json, guildIds);
        }
        
        this.client.emit(Events.Debug, `Deployed commands to ${guildCommandData.size.toString()} guilds`);
        this.client.emit(Events.Debug, 'Commands registered');
    }
    /**
     * Deregister commands for one or more guilds
     * @param guildId optional Id to only remove commands from on guild
     */
    async deregisterGuildCommands(guildId?: string) {
        try {
            if (guildId !== undefined) {
                await this.rest.put(Routes.applicationGuildCommands(this.client.user.id, guildId), { body: [] })
                    .catch((e: unknown) => {
                        if(e instanceof Error)
                            this.client.emit(Events.Error, e)
                        }
                    );
                this.client.emit(Events.Debug, `Successfully deleted all guild commands in ${guildId}.`)
            }
            
            else {
                for ([guildId] of await (this.client.guilds.fetch())) {
                    await this.rest.put(Routes.applicationGuildCommands(this.client.user.id, guildId), { body: [] })
                        .catch((e: unknown) => {
                            if(e instanceof Error)
                                this.client.emit(Events.Error, e)
                            }
                        );
                }
                
                this.client.emit(Events.Debug, `Successfully deleted all guild commands.`);
            }
        }
        catch (error) {
            if(error instanceof Error)
                this.client.emit(Events.Error, error);
        }
        
    }

    /**
     * Run function for a chat command in handler
     * @param interaction received interaction
     */
    runChatCommand(interaction: ChatInputCommandInteraction) {
        this.chatCommands.get(interaction.commandName)?.execute(interaction);
    }

    /**
     * Run function for an autocomplete interaction in handler
     * @param interaction received interaction
     */
    runAutocomplete(interaction: AutocompleteInteraction) {
        this.chatCommands.get(interaction.commandName)?.autocomplete(interaction);
    }

    /**
     * Run function for a user context command in handler
     * @param interaction received interaction
     */
    runUserContextMenus(interaction: ContextMenuCommandInteraction) {
        this._userContextMenus.get(interaction.commandName)?.execute(interaction);
    }

    /**
     * Run function for a message context command in handler
     * @param interaction received interaction
     */
    runMessageContextMenus(interaction: ContextMenuCommandInteraction) {
        this._messageContextMenus.get(interaction.commandName)?.execute(interaction);
    }
    /**
     * create a command handler
     * @param client parent client
     */
    constructor(client: Client) {
        this.client = client;
    }
}
