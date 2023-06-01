import { join } from 'path';
import { readdir } from 'fs/promises';
import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	Client,
	ClientOptions,
	Collection,
	DiscordjsError,
	ModalSubmitInteraction,
	REST,
	RESTPatchAPIApplicationCommandJSONBody,
	Routes,
	Snowflake,
	Interaction as DInteraction,
	ApplicationCommand,
	Events,
	DiscordjsErrorCodes
} from 'discord.js';

import {
	ChatInputCommand, Command, ContextMenuCommand 
} from './Command';
import { Event } from './Event';
import { Interaction } from './Interaction';

import { Mutable } from './types';
import { onInteractionCreate } from './interactionCreate';
import Logger from '../structures/Logger';

// TypeScript or JavaScript environment (thanks to https://github.com/stijnvdkolk)
// eslint-disable-next-line import/no-mutable-exports
export let tsNodeRun = false;
try {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (process[Symbol.for('ts-node.register.instance')]) {
		tsNodeRun = true;
	}
}
catch (e) {
	/* empty */
}

/**
 * Returns a boolean and Types a unknown as ErrnoException if the object is an error
 * @param error Any unknown object
 * @returns A boolean value if the the object is a ErrnoException
 */
// eslint-disable-next-line no-undef
function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error;
}

/**
 * Converts Commands and Interactions in to Collection objects
 * @param dirPath Root directory of object
 * @returns Collection of Type
 */
async function fileToCollection<Type extends Command | Interaction<DInteraction>>(dirPath: string): Promise<Collection<string, Type>> {
	const collection: Collection<string, Type> = new Collection();

	try {
		const dirents = await readdir(dirPath, { withFileTypes: true });

		for (const file of dirents.filter((dirent) => !dirent.isDirectory() && dirent.name.endsWith(tsNodeRun ? '.ts' : '.js'))) {
			const resp: { default: Type } = await import(join(dirPath, file.name));

			const name =
				(resp.default as Command).builder !== undefined ? (resp.default as Command).builder.name : (resp.default as Interaction<DInteraction>).name;

			collection.set(name, resp.default);
		}

		for (const dir of dirents.filter((dirent) => dirent.isDirectory())) {
			const directoryPath = join(dirPath, dir.name);
			const dirFiles = await readdir(directoryPath);

			for (const file of dirFiles.filter((f) => f.endsWith(tsNodeRun ? '.ts' : '.js'))) {
				const resp: { default: Type } = await import(join(directoryPath, file));

				const name =
					(resp.default as Command).builder !== undefined ? (resp.default as Command).builder.name : (resp.default as Interaction<DInteraction>).name;

				collection.set(name, resp.default);
			}
		}
	}
	catch (error) {
		if (isErrnoException(error) && error.code === 'ENOENT' && error.syscall === 'scandir') {
			Logger.warn(`Directory not found at ${error.path}`);
		}
		else {
			throw error;
		}
	}

	return collection;
}

export interface ExtendedClientOptions extends ClientOptions {
	receiveMessageComponents?: boolean;
	receiveModals?: boolean;
	receiveAutocomplete?: boolean;
	replyOnError?: boolean;
	splitCustomID?: boolean;
	splitCustomIDOn?: string;
	useGuildCommands?: boolean;
}

export interface initOptions {
	commandPath?: string;
	contextMenuPath?: string;
	buttonPath?: string;
	selectMenuPath?: string;
	modalPath?: string;
	eventPath: string;
}

/**
 * ExtendedClient is extended from the {@import ('discord.js').Client}.
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Client}
 */
export class ExtendedClient extends Client {
	readonly rest = new REST({ version: '10' });

	/**
	 * Collection of Chat Input Commands
	 */
	readonly commands: Collection<string, ChatInputCommand>;

	/**
	 * Collection of Context Menu Commands
	 */
	readonly contextMenus: Collection<string, ContextMenuCommand>;

	/**
	 * Collection of Events
	 */
	readonly events: Collection<string, Event> = new Collection();

	/**
	 * Collection of Button Interactions
	 */
	readonly buttons: Collection<string, Interaction<ButtonInteraction>>;

	/**
	 * Collection of Select Menu Interactions
	 */
	readonly selectMenus: Collection<string, Interaction<AnySelectMenuInteraction>>;

	/**
	 * Collection of Modal Submit Interactions
	 */
	readonly modals: Collection<string, Interaction<ModalSubmitInteraction>>;

	/**
	 * Whether the bot should responded to buttons or select menus
	 */
	readonly receiveMessageComponents: boolean;

	/**
	 * Whether the bot should responded to modals
	 */
	readonly receiveModals: boolean;

	/**
	 * Whether the bot should responded to autocomplete
	 */
	readonly receiveAutocomplete: boolean;

	/**
	 * Whether the bot should responded to autocomplete
	 */
	readonly replyOnError: boolean;

	/**
	 * Whether the bot should split interactions' custom ids (Recommended `true`)
	 */
	readonly splitCustomID: boolean;

	/**
	 * The sting that is used to split the custom id
	 */
	readonly splitCustomIDOn: string;

	/**
	 * Should bot push guild specific commands at start up
	 */
	readonly useGuildCommands: boolean;

	/**
	 * Checks if the init function has run
	 */
	private hasInitRun = false;

	/**
	 *
	 * @param options Options for the client
	 * @see https://discord.js.org/#/docs/discord.js/main/typedef/ClientOptions
	 */
	constructor(options: ExtendedClientOptions) {
		super(options);

		Logger.info('Client starting up...');

		// Paths
		const {
			receiveMessageComponents, receiveModals, receiveAutocomplete, replyOnError, splitCustomID, splitCustomIDOn, useGuildCommands 
		} = options;

		// MICS configuration
		this.receiveMessageComponents = receiveMessageComponents === undefined ? false : receiveMessageComponents;
		this.receiveModals = receiveModals === undefined ? false : receiveModals;
		this.receiveAutocomplete = receiveAutocomplete === undefined ? false : receiveAutocomplete;
		this.replyOnError = replyOnError === undefined ? false : replyOnError;
		this.splitCustomID = splitCustomID === undefined ? false : splitCustomID;
		this.splitCustomIDOn = splitCustomIDOn || '_';
		this.useGuildCommands = useGuildCommands === undefined ? false : useGuildCommands;

		this.on(Events.InteractionCreate, onInteractionCreate);
		this.events.set(Events.InteractionCreate, new Event({ name: Events.InteractionCreate, execute: onInteractionCreate }));
	}

	public async init(options: initOptions) {
		await Promise.all([
			this.loadEvents(options.eventPath),
			this.loadCommands(options.commandPath),
			this.loadContextMenus(options.contextMenuPath),
			this.loadButtons(options.buttonPath),
			this.loadSelectMenus(options.selectMenuPath),
			this.loadModals(options.modalPath)
		]);

		this.hasInitRun = true;

		return this;
	}

	private async loadEvents(eventPath: string) {
		const dir = await readdir(eventPath);
		const files = dir.filter((file) => file.endsWith(tsNodeRun ? '.ts' : '.js'));

		for (const file of files) {
			const event = (await import(join(eventPath, file))).default as Event;

			this.events.set(event.name, event);

			if (event.once) {
				this.once(event.name, (...args) => event.execute(...args));
			}
			else {
				this.on(event.name, (...args) => event.execute(...args));
			}
		}

		const numberOfEvents = this.events.size;
		Logger.info(`Loaded ${this.events.size} events.`);
		return numberOfEvents;
	}

	private async loadSelectMenus(path?: string) {
		// Select Menu Handler
		if (path) {
			(this as Mutable<ExtendedClient>).selectMenus = await fileToCollection<Interaction<AnySelectMenuInteraction>>(path);
		}
	}

	private async loadButtons(path?: string) {
		// Button Handler
		if (path) {
			(this as Mutable<ExtendedClient>).buttons = await fileToCollection<Interaction<ButtonInteraction>>(path);
		}
	}

	private async loadModals(path?: string) {
		// Modal Handler
		if (path) {
			(this as Mutable<ExtendedClient>).modals = await fileToCollection<Interaction<ModalSubmitInteraction>>(path);
		}
	}

	private async loadContextMenus(path?: string) {
		// Context Menu Handler
		if (path) {
			(this as Mutable<ExtendedClient>).contextMenus = await fileToCollection<ContextMenuCommand>(path);
		}
	}

	private async loadCommands(path?: string) {
		(this as Mutable<ExtendedClient>).commands = await fileToCollection<ChatInputCommand>(path);
	}

	// TODO: fix spelling
	/**
	 * Deploy Application Commands to Discord
	 * @param guild if commands deploys subset of commands that should only be deployed to a specific guild
	 * @see https://discord.com/developers/docs/interactions/application-commands
	 */
	public async deploy(guild?: Snowflake) {
		if (!this.token) {
			throw new DiscordjsError(DiscordjsErrorCodes.TokenMissing);
		}

		Logger.info('Deploying commands...');

		if (guild === undefined) {
			// Gets chat commands that are global
			const globalDeploy: RESTPatchAPIApplicationCommandJSONBody[] = this.commands.filter((f) => f.isGlobal !== false).map((m) => m.builder.toJSON());

			// Gets context menu commands that are global
			globalDeploy.push(...this.contextMenus.filter((f) => f.isGlobal !== false).map((m) => m.builder.toJSON()));

			// Put the JSON API object to the aplicationCommands endPoint
			const pushedCommands = (await this.rest
				.put(Routes.applicationCommands(this.user.id), { body: globalDeploy })
				.catch((e) => Logger.error(e))) as ApplicationCommand[];

			Logger.info(`Deployed ${pushedCommands.length} global command(s)`);
		}
		else if (this.useGuildCommands) {
			// TODO: Guild Commands
		}
	}

	public login(token?: string) {
		if (!this.hasInitRun) {
			throw Error('[ERROR] client.init() has not been completed');
		}

		if (!process.env.TOKEN) {
			throw new Error('[ERROR] Missing token');
		}

		(this as Mutable<ExtendedClient>).rest = this.rest.setToken(token);

		return super.login(token);
	}
}
