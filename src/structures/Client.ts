import {
	AnySelectMenuInteraction,
	ApplicationCommand,
	ButtonInteraction,
	Client,
	ClientOptions,
	Collection,
	ModalSubmitInteraction,
	REST,
	RESTPatchAPIApplicationCommandJSONBody,
	Routes
} from 'discord.js';
import path from 'path';
import { readdir } from 'fs/promises';
import {
	ChatInputCommand,
	CommandOptions,
	ContextMenuCommand
} from './Command';
import { Event } from './Event';
import { Interaction, InteractionOptions } from './Interaction';
import Logger from './Logger';

// TypeScript or JavaScript environment (thanks to https://github.com/stijnvdkolk)
let tsNodeRun = false;
try {
	// @ts-ignore
	if (process[Symbol.for('ts-node.register.instance')]) {
		tsNodeRun = true;
	}
}
catch (e) {
	/* empty */
}

export interface ExtendedClientOptions extends ClientOptions {
	restVersion?: string;
	commandPath?: string;
	contextMenuPath?: string;
	buttonPath?: string;
	selectMenuPath?: string;
	modalPath?: string;
	eventsPath: string;
	receiveMessageComponents?: boolean;
	receiveModals?: boolean;
	receiveAutocomplete?: boolean;
	replyOnError?: boolean;
	splitCustomID?: boolean;
	splitCustomIDOn?: string;
	useGuildCommands?: boolean;
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
async function fileToCollection<
	Type extends CommandOptions | InteractionOptions
>(dirPath: string): Promise<Collection<string, Type>> {
	const collection: Collection<string, Type> = new Collection();

	try {
		const dirents = await readdir(dirPath, { withFileTypes: true });

		await Promise.all(
			dirents.map(async (dirent) => {
				if (dirent.isDirectory()) {
					const directoryPath = path.join(dirPath, dirent.name);
					const files = await readdir(directoryPath);

					await Promise.all(
						files
							.filter((file) =>
								file.endsWith(tsNodeRun ? '.ts' : '.js')
							)
							.map(async (file) => {
								const resp: { default: Type } = await import(
									path.join(directoryPath, file)
								);

								collection.set(
									(resp.default as CommandOptions).builder !==
										undefined
										? (resp.default as CommandOptions)
											.builder.name
										: (resp.default as InteractionOptions)
											.name,
									resp.default
								);
							})
					);
				}
				else if (dirent.name.endsWith(tsNodeRun ? '.ts' : '.js')) {
					const resp: { default: Type } = await import(
						path.join(dirPath, dirent.name)
					);

					collection.set(
						(resp.default as CommandOptions).builder !== undefined
							? (resp.default as CommandOptions).builder.name
							: (resp.default as InteractionOptions).name,
						resp.default
					);
				}
			})
		);
	}
	catch (error) {
		if (
			isErrnoException(error) &&
			error.code === 'ENOENT' &&
			error.syscall === 'scandir'
		) {
			Logger.warn(`[Warning] Directory not found at ${error.path}`);
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
	commands: Collection<string, ChatInputCommand>;

	/**
	 * Collection of Context Menu Commands
	 */
	contextMenus: Collection<string, ContextMenuCommand>;

	/**
	 * Collection of Events
	 */
	events: Collection<string, Event> = new Collection();

	/**
	 * Collection of Button Interactions
	 */
	buttons: Collection<string, Interaction<ButtonInteraction>>;

	/**
	 * Collection of Select Menu Interactions
	 */
	selectMenus: Collection<string, Interaction<AnySelectMenuInteraction>>;

	/**
	 * Collection of Modal Submit Interactions
	 */
	modals: Collection<string, Interaction<ModalSubmitInteraction>>;

	receiveMessageComponents: boolean;

	receiveModals: boolean;

	receiveAutocomplete: boolean;

	readonly replyOnError: boolean;

	readonly splitCustomID: boolean;

	readonly splitCustomIDOn: string;

	readonly useGuildCommands: boolean;

	private readonly extendedOptions: ExtendedClientOptions;

	/**
	 *
	 * @param options Options for the client
	 * @see https://discord.js.org/#/docs/discord.js/main/typedef/ClientOptions
	 */
	constructor(options: ExtendedClientOptions) {
		super(options);

		Logger.debug('Starting up...');

		// Paths
		const {
			restVersion,
			receiveMessageComponents,
			receiveModals,
			receiveAutocomplete,
			replyOnError,
			splitCustomID,
			splitCustomIDOn,
			useGuildCommands
		} = options;

		this.extendedOptions = options;

		// REST Version
		this.restVersion = restVersion || '10';

		// MICS configuration
		this.receiveMessageComponents =
			receiveMessageComponents === undefined
				? false
				: receiveMessageComponents;
		this.receiveModals =
			receiveModals === undefined ? false : receiveModals;
		this.receiveAutocomplete =
			receiveAutocomplete === undefined ? false : receiveAutocomplete;
		this.replyOnError = replyOnError === undefined ? false : replyOnError;
		this.splitCustomID =
			splitCustomID === undefined ? false : splitCustomID;
		this.splitCustomIDOn = splitCustomIDOn || '_';
		this.useGuildCommands =
			useGuildCommands === undefined ? false : useGuildCommands;
	}

	public async init() {
		const {
			commandPath,
			contextMenuPath,
			buttonPath,
			selectMenuPath,
			modalPath,
			eventsPath
		} = this.extendedOptions;

		// Command Handler
		if (commandPath) {
			this.commands = await fileToCollection<ChatInputCommand>(
				commandPath
			);
		}

		// Context Menu Handler
		if (contextMenuPath) {
			this.contextMenus = await fileToCollection<ContextMenuCommand>(
				contextMenuPath
			);
		}

		// Interaction Handlers
		// Button Handler
		if (buttonPath) {
			this.buttons = await fileToCollection<
				Interaction<ButtonInteraction>
			>(buttonPath);
		}

		// Select Menu Handler
		if (selectMenuPath) {
			this.selectMenus = await fileToCollection<
				Interaction<AnySelectMenuInteraction>
			>(selectMenuPath);
		}

		// Modal Handler
		if (modalPath) {
			this.modals = await fileToCollection<
				Interaction<ModalSubmitInteraction>
			>(modalPath);
		}

		// Event Handler
		const events = await readdir(eventsPath);

		events
			.filter((dir) => dir.endsWith(tsNodeRun ? '.ts' : '.js'))
			.forEach((file) =>
				import(path.join(eventsPath, file)).then(
					(event: { default: Event }) => {
						this.events.set(event.default.name, event.default);

						if (event.default.once) {
							this.once(event.default.name, (...args) =>
								event.default.execute(...args)
							);
						}
						else {
							this.on(event.default.name, (...args) =>
								event.default.execute(...args)
							);
						}
					}
				)
			);
	}

	/**
	 * Deploy Application Commands to Discord
	 * @see https://discord.com/developers/docs/interactions/application-commands
	 */
	public async deploy() {
		if (!this.token) {
			throw Error('Token not present at command deployment');
		}

		Logger.debug('Deploying commands...');

		const rest = new REST({ version: this.restVersion }).setToken(
			this.token
		);

		const globalDeploy: RESTPatchAPIApplicationCommandJSONBody[] =
			this.commands.map((m) => m.builder.toJSON());

		globalDeploy.concat(this.contextMenus.map((m) => m.builder.toJSON()));

		// Deploy global commands
		if (!this.user?.id) {
			throw Error('Application ID not present at command deployment');
		}

		const applicationCommands = (await rest
			.put(Routes.applicationCommands(this.user?.id), {body: globalDeploy})
			.catch((e) => Logger.error(e))) as ApplicationCommand[];

		return Logger.debug(
			`Deployed ${applicationCommands.length} global command(s)`
		);
	}
}
