import {
	AnySelectMenuInteraction, ApplicationCommand, ButtonInteraction, Client, ClientOptions, Collection, ColorResolvable, ModalSubmitInteraction, REST,
	RESTPatchAPIApplicationCommandJSONBody, Routes, Snowflake
} from 'discord.js';
import path from 'path';
import { readdirSync } from 'fs';
import {
	ChatInputCommand, CommandOptions, ContextMenuCommand
} from './Command';
import { Event } from './Event';
import { Interaction, InteractionOptions } from './Interaction';

// TypeScript or JavaScript environment (thanks to https://github.com/stijnvdkolk)
let tsNodeRun = false;
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

export interface ExtendedClientOptions extends ClientOptions {
    restVersion?: string
	commandPath?: string
    contextMenuPath?: string
    buttonPath?: string
    selectMenuPath?: string
    modalPath?: string
    eventPath: string
	receiveMessageComponents?: boolean
	receiveModals?: boolean
	receiveAutocomplete?: boolean
	replyOnError?: boolean
	splitCustomId?: boolean
	splitCustomIdOn?: string
	useGuildCommands?: boolean
}

/**
 * Returns a boolean and Types a unkown as ErrnoException if the object is an error
 * @param error Any unkown object
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
function fileToCollection<Type extends CommandOptions | InteractionOptions>(dirPath: string): Collection<string, Type> {
	const collection: Collection<string, Type> = new Collection();

	try {
		const dirents = readdirSync(dirPath, { withFileTypes: true });

		dirents.filter((dirent) => dirent.isDirectory()).forEach((dir) => {
			const directoryPath = path.join(dirPath, dir.name);
			readdirSync(directoryPath).filter((file) => file.endsWith(tsNodeRun ? '.ts' : '.js')).forEach((file) => {
				import(path.join(directoryPath, file)).then((resp: { default: Type }) => {
					collection.set(((resp.default as CommandOptions).builder !== undefined)
						? (resp.default as CommandOptions).builder.name
						: (resp.default as InteractionOptions).name, resp.default);
				});
			});
		});

		dirents.filter((dirent) => !dirent.isDirectory() && dirent.name.endsWith(tsNodeRun ? '.ts' : '.js')).forEach((file) => {
			import(path.join(dirPath, file.name)).then((resp: { default: Type }) => {
				collection.set(((resp.default as CommandOptions).builder !== undefined)
					? (resp.default as CommandOptions).builder.name
					: (resp.default as InteractionOptions).name, resp.default);
			});
		});
	}
	catch (error) {
		if (isErrnoException(error) && error.code === 'ENOENT' && error.syscall === 'scandir') {
			console.warn(`[Warning] Directory not found at ${error.path}`);
		}
		else {
			throw error;
		}
	}
	return collection;
}

/**
 * ExtendedClient is extends frome `Discord.js`'s Client
 */
export default class ExtendedClient extends Client {
	/**
	 * REST API version for command deployment and other actions
	 */
	readonly restVersion: '10' | '9' | string;

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

	readonly receiveMessageComponents: boolean;

	readonly receiveModals: boolean;

	readonly receiveAutocomplete: boolean;

	readonly replyOnError: boolean;

	readonly splitCustomId: boolean;

	readonly splitCustomIdOn: string;

	readonly useGuildCommands: boolean;

	/**
     *
     * @param options Options for the client
     * @see https://discord.js.org/#/docs/discord.js/main/typedef/ClientOptions
     */
	constructor(options: ExtendedClientOptions) {
		super(options);

		console.log('\nStarting up...\n');

		// Paths
		const {
			restVersion, commandPath, contextMenuPath, buttonPath, selectMenuPath, modalPath, eventPath, receiveMessageComponents, receiveModals,
			receiveAutocomplete, replyOnError, splitCustomId, splitCustomIdOn, useGuildCommands
		} = options;

		// REST Version
		this.restVersion = restVersion || '10';

		// Command Handler
		if (commandPath) this.commands = fileToCollection<ChatInputCommand>(commandPath);

		// Context Menu Handler
		if (contextMenuPath) this.contextMenus = fileToCollection<ContextMenuCommand>(contextMenuPath);

		// Interaction Handlers
		// Button Handler
		if (buttonPath) this.buttons = fileToCollection<Interaction<ButtonInteraction>>(buttonPath);

		// Select Menu Handler
		if (selectMenuPath) this.selectMenus = fileToCollection<Interaction<AnySelectMenuInteraction>>(selectMenuPath);

		// Modal Handler
		if (modalPath) this.modals = fileToCollection<Interaction<ModalSubmitInteraction>>(modalPath);

		// MICS configeration
		this.receiveMessageComponents = receiveMessageComponents === undefined ? false : receiveMessageComponents;
		this.receiveModals = receiveModals === undefined ? false : receiveModals;
		this.receiveAutocomplete = receiveAutocomplete === undefined ? false : receiveAutocomplete;
		this.replyOnError = replyOnError === undefined ? false : replyOnError;
		this.splitCustomId = splitCustomId === undefined ? false : splitCustomId;
		this.splitCustomIdOn = splitCustomIdOn || '_';
		this.useGuildCommands = useGuildCommands === undefined ? false : useGuildCommands;

		// Event Handler
		readdirSync(eventPath).filter((dir) => dir.endsWith(tsNodeRun ? '.ts' : '.js')).forEach((file) => import(path.join(eventPath, file))
			.then((event: { default: Event }) => {
				// console.log(event.default);

				this.events.set(event.default.name, event.default);

				if (event.default.once) {
					this.once(event.default.name, (...args) => event.default.execute(...args));
				}
				else {
					this.on(event.default.name, (...args) => event.default.execute(...args));
				}
			}));
	}

	/**
     * Deploy Application Commands to Discord
     * @see https://discord.com/developers/docs/interactions/application-commands
     */
	public async deploy() {
		if (!this.token) {
			return console.error('[Error] Token not present at command deployment');
		}

		console.log('[INFO] Deploying commands...');

		const rest = new REST({ version: this.restVersion }).setToken(this.token);
		const globalDeploy: RESTPatchAPIApplicationCommandJSONBody[] = this.commands
			.map((m) => m.builder.toJSON());
		globalDeploy.concat(this.contextMenus.map((m) => m.builder.toJSON()));

		// Deploy global commands
		if (!this.user?.id) return console.warn('[Error] Application ID not present at command deployment');

		const applicationCommands = await rest.put(Routes.applicationCommands(this.user?.id), { body: globalDeploy })
			.catch(console.error) as ApplicationCommand[];

		return console.log(`[INFO] Deployed ${applicationCommands.length} global command(s)`);
	}
}

declare module 'discord.js' {
    interface BaseInteraction { client: ExtendedClient}
    interface Component { client: ExtendedClient }
    interface Message { client: ExtendedClient }
    interface BaseChannel { client: ExtendedClient }
    interface Role { client: ExtendedClient }
    interface Guild { client: ExtendedClient }
	interface User { client: ExtendedClient }
	interface GuildMember { client: ExtendedClient }
}
