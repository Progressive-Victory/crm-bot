import { DiscordAPIError, Interaction } from 'discord.js';
import Logger from './util/Logger';

export async function onInteractionCreate(interaction: Interaction) {
	let interactionName: string;
	const { client } = interaction;

	try {
		// Runs if slash commands
		if (interaction.isChatInputCommand()) {
			await client.commands.get(interaction.commandName)?.execute(interaction);
		}
		// Runs if context commands
		else if (interaction.isContextMenuCommand()) {
			await client.contextMenus.get(interaction.commandName)?.execute(interaction);
		}
		// Runs if slash commands option autocomplete
		else if (interaction.isAutocomplete()) {
			const autocomplete = client.commands.get(interaction.commandName)?.autocomplete;
			if (!autocomplete) {
				Logger.warn(`Autocomplete for ${interaction.commandName} was not Setup`);
			}
			else {
				await autocomplete(interaction);
			}
		}
		// Runs if select menu
		else if (interaction.isAnySelectMenu()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.selectMenus.get(interactionName)?.execute(interaction);
		}
		// Runs if button
		else if (interaction.isButton()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.buttons.get(interactionName)?.execute(interaction);
		}
		// Runs if model
		else if (interaction.isModalSubmit()) {
			interactionName = client.splitCustomID ? interaction.customId.split(client.splitCustomIDOn)[0] : interaction.customId;
			await client.modals.get(interactionName)?.execute(interaction);
		}
	}
	catch (error) {
		// Checks if the interaction is repiliable
		if (interaction.isRepliable()) {
			// If the error is from the discord api is is logged
			if (error instanceof DiscordAPIError) {
				Logger.error(error);
			}
			else if (error instanceof Error) {
				Logger.error(error);
				// Check if client is set to not send reply on error
				if (!interaction.client.replyOnError) return;

				const errorMessage = 'There was an error while executing this interaction.';

				// Check if interaction was deferred
				if (interaction.deferred) {
					// If defered interactions is followed up
					await interaction.followUp({ content: errorMessage, ephemeral: true }).catch((e) => Logger.error(e));
				}
				else {
					// Else the interactions is replied to
					await interaction.reply({ content: errorMessage, ephemeral: true }).catch((e) => Logger.error(e));
				}
			}
		}
		// If the interaction can not be repliyed to the error is logged
		else Logger.error(error);
	}
}
