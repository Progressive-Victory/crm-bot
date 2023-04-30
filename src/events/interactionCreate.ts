/* eslint-disable no-case-declarations */

import {
	ApplicationCommandType,
	ComponentType,
	Events,
	Interaction,
	InteractionType,
	RepliableInteraction
} from 'discord.js';
import Event from '../structures/Event';
import Languages from '../assets/languages';
import Logger from '../structures/Logger';

const errorMessage = '[Error] There was an error while executing this interaction.';

async function replyError(error: unknown, interaction: RepliableInteraction) {
	if (error instanceof Error) {
		console.error(error);
		if (interaction.client.replyOnError) return;

		if (interaction.deferred) {
			await interaction.followUp({ content: errorMessage }).catch(console.error);
		}
		else {
			await interaction.reply({ content: errorMessage, ephemeral: true }).catch(console.error);
		}
	}
}

async function onInteractionCreate(interaction: Interaction) {
	let interactionName: string;
	try {
		if (!interaction.inCachedGuild()) {
			await interaction.channel.guild.fetch();
		}
		// console.log(interaction);
		switch (interaction.type) {
		case InteractionType.ApplicationCommand:

			switch (interaction.commandType) {
			// Chat Input Command
			case ApplicationCommandType.ChatInput:
				// console.log(interaction.client.commands);
				interaction.client.commands.get(interaction.commandName)?.execute(interaction);
				Logger.debug(`Executed Slash Command ${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`);
				break;

				// Context Menu
			case ApplicationCommandType.Message:
			case ApplicationCommandType.User:
				interaction.client.contextMenus.get(interaction.commandName)?.execute(interaction);
				Logger.debug(`Executed Contex Menu Command ${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`);
				break;
			default:
				break;
			}
			break;
			// Component (Button | Select Menu)
		case InteractionType.MessageComponent:

			if (!interaction.client.receiveMessageComponents) return;
			interactionName = interaction.client.splitCustomId ? interaction.customId.split('_')[0] : interaction.customId;

			switch (interaction.componentType) {
			case ComponentType.Button:
				// Check if message components are enabled
				if (!interaction.client.receiveMessageComponents) return;
				interaction.client.buttons.get(interactionName)?.execute(interaction);
				break;

			case ComponentType.ChannelSelect:
			case ComponentType.RoleSelect:
			case ComponentType.UserSelect:
			case ComponentType.MentionableSelect:
			case ComponentType.StringSelect:
				interaction.client.selectMenus.get(interactionName)?.execute(interaction);
				break;
			default:
				break;
			}

			break;
			// ModalSubmit
		case InteractionType.ModalSubmit:
			// Check if modal interactions are enabled
			if (!interaction.client.receiveModals) return;
			interactionName = interaction.client.splitCustomId ? interaction.customId.split('_')[0] : interaction.customId;
			interaction.client.modals.get(interactionName)?.execute(interaction);
			break;
		case InteractionType.ApplicationCommandAutocomplete:
			// Check if autocomplete interactions are enabled
			if (!interaction.client.receiveAutocomplete) return;
			interactionName = interaction.commandName;
			// eslint-disable-next-line no-case-declarations
			const autocomplete = interaction.client.commands.get(interactionName)?.autocomplete;
			if (!autocomplete) {
				console.warn(`[Warning] Autocomplete for ${interactionName} was not Setup`);
			}
			else {
				autocomplete(interaction);
			}
			break;
		default:
			break;
		}
	}
	catch (error) {
		if (interaction.isRepliable()) replyError(error, interaction);
		else console.error(error);
	}
}

export default new Event()
	.setName(Events.InteractionCreate)
	.setExecute(onInteractionCreate);
