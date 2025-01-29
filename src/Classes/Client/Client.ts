import { Client, Events } from 'discord.js';
import {
	CommandHandler, EventHandler, InteractionHandler
} from '../Handlers/index.js';
import { ExtendedClientOptions } from './interfaces.js';

/**
 * Client is extended from the {@import ('discord.js').Client}.
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Client}
 */
export class ExtendedClient extends Client<true> {

    private _eventHandler = new EventHandler(this);

    private _commandHandler = new CommandHandler(this);

    private _interactionHandler = new InteractionHandler(this);

    // Whether the bot should responded to buttons or select menus
    readonly receiveMessageComponents: boolean;

    // Whether the bot should responded to modals
    readonly receiveModals: boolean;

    // Whether the bot should responded to autocomplete
    readonly receiveAutocomplete: boolean;

    // Whether the bot should responded to autocomplete
    readonly replyOnError: boolean;

    // Message for errors in the interactionCreate
    readonly errorMessage: string = 'There was an error while executing this interaction.';

    // The sting that is used to split the custom id
    readonly splitCustomIdOn?: string;

    // should the bot use the provided InteractionCreate event 
    readonly useDefaultInteractionEvent: boolean = true;

    // Checks if the init function has run
    private _hasInitRun = false;

    get loggedIn() {
        return this._hasInitRun;
    }

    get events() {
        return this._eventHandler;
    }

    get commands() {
        return this._commandHandler;
    }

    get interactions() {
        return this._interactionHandler;
    }

    /**
     *
     * @param options Options for the client
     * @see https://discord.js.org/#/docs/discord.js/main/typedef/ClientOptions
     */
    constructor(options: ExtendedClientOptions) {
        super(options);

        this.emit(Events.Debug, 'Client starting up...');

		// Paths
		const {
			receiveMessageComponents,
			receiveModals,
			receiveAutocomplete,
			replyOnError,
			replyMessageOnError,
			splitCustomIdOn
		} = options;

		// Misc configuration
		this.receiveMessageComponents = receiveMessageComponents ?? false;
		this.receiveModals = receiveModals ?? false;
		this.receiveAutocomplete = receiveAutocomplete ?? false;
		this.replyOnError = replyOnError ?? false;
		this.splitCustomIdOn = splitCustomIdOn ?? undefined;
		if (replyMessageOnError) this.errorMessage = replyMessageOnError;
	}

    /**
     * Login to the Discord WS
     * @param token The bot's Discord token
     * @returns string response
     */
    public async login(token?: string) {   
        this._hasInitRun = true;
        return super.login(token);
    }
}
