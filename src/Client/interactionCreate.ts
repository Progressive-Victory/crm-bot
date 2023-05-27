import {
	DiscordAPIError, Interaction, RepliableInteraction 
} from 'discord.js';
import Logger from '../structures/Logger';

// Send a warning on error
async function replyError(error: unknown, interaction: RepliableInteraction) {
	if (error instanceof DiscordAPIError) {
		Logger.error(error);
	}
	else if (error instanceof Error) {
		Logger.error(error);

		if (!interaction.client.replyOnError) return;

		const errorMessage = 'There was an error while executing this interaction.';

		if (interaction.deferred) {
			await interaction.followUp({ content: errorMessage, ephemeral: true }).catch((e) => Logger.error(e));
		}
		else {
			await interaction.reply({ content: errorMessage, ephemeral: true }).catch((e) => Logger.error(e));
		}
	}
}

export async function onInteractionCreate(interaction: Interaction) {
	let interactionName: string;
	const { client } = interaction;

	try {
		if (interaction.isChatInputCommand()) {
			await client.commands.get(interaction.commandName)?.execute(interaction);
		}
		else if (interaction.isContextMenuCommand()) {
			await client.contextMenus.get(interaction.commandName)?.execute(interaction);
		}
		else if (interaction.isAutocomplete()) {
			const autocomplete = client.commands.get(interaction.commandName)?.autocomplete;
			if (!autocomplete) {
				Logger.warn(`Autocomplete for ${interaction.commandName} was not Setup`);
			}
			else {
				await autocomplete(interaction);
			}
		}
		else if (interaction.isAnySelectMenu()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.selectMenus.get(interactionName)?.execute(interaction);
		}
		else if (interaction.isButton()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.buttons.get(interactionName)?.execute(interaction);
		}
		else if (interaction.isModalSubmit()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.modals.get(interactionName)?.execute(interaction);
		}
	}
	catch (error) {
		if (interaction.isRepliable()) replyError(error, interaction);
		else Logger.error(error);
	}
}
