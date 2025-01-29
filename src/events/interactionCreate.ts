import {
	DiscordAPIError, Events, Interaction,
	InteractionType
} from 'discord.js';
import { Event } from '../Classes/Event.js';
import { GuildSetting } from '../models/Setting.js';

/**
 * Handles the creation of a new interaction.
 * @param interaction - The interaction object.
 */
async function onInteractionCreate(interaction: Interaction): Promise<void> {
	const { client, type } = interaction;
	const {
		commands, interactions, errorMessage, replyOnError
	} = client;

	if(interaction.inGuild()) {
		const setting = await GuildSetting.findOne({guildId:interaction.guildId})
		if(!setting)
			GuildSetting.create({
			guildId: interaction.guildId,
			guildName: interaction.guild?.name
		})
		else if (interaction.guild?.name !== setting.guildName) {
			setting.guildName = interaction.guild?.name ?? 'Name Unknown'
			setting.save()
		}	
	}
	 
	client.emit(Events.Debug, interaction.toString());
	try {
		switch (type) {
			case InteractionType.ApplicationCommandAutocomplete:
				// If the interaction is an autocomplete request, handle autocomplete
				void commands.runAutocomplete(interaction);
				break;
			case InteractionType.ModalSubmit:
				// If the interaction is a modal submit interaction, execute the corresponding modal submit handler
				void interactions.runModal(interaction);
				break;
            case InteractionType.MessageComponent:
                if (interaction.isButton()) {
                    // If the interaction is a button interaction, execute the corresponding button handler
                    interactions.runButton(interaction);
                }
                else if (interaction.isAnySelectMenu()) {
                    // If the interaction is a select menu interaction, execute the corresponding select menu handler
                    interactions.runSelectMenus(interaction);
                }   
                break;

            default:
                break;
        }
    }
    catch (error) {
        if (interaction.isRepliable()) {
            // If the interaction is repliable, handle the error with a reply
            if (error instanceof DiscordAPIError) {
                client.emit(Events.Error, error); 
            }
            else if (error instanceof Error) {
                client.emit(Events.Error, error);
        
                if (!replyOnError) return;
        
                if (interaction.deferred) {
                    // If the interaction is deferred, follow up with an ephemeral error message
                    void interaction.followUp({ content: errorMessage, ephemeral: true }).catch((e: unknown) => {
                        if(e instanceof Error)
                            client.emit(Events.Error, e)
                    });
                }
                else {
                    // If the interaction is not deferred, reply with an ephemeral error message
                    void interaction.reply({ content: errorMessage, ephemeral: true }).catch((e: unknown) => {
                        if(e instanceof Error)
                            client.emit(Events.Error, e)
                    });
                }       
            }
        }
        else {
            // If the interaction is not repliable, simply log the error
            throw error;
        }
    }
}

export const interactionCreate = new Event({
	name: Events.InteractionCreate,
	once: false,
	execute: onInteractionCreate
});
