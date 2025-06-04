import { CacheType, ChannelType, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';

// this probably SUCKS we should find a prettier way to do it
const stackStore = new Map<string, string>();

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName("stack")
		.setDescription("Talking over people wouldn't be very dark woke of you")
	)
	.setExecute(run);


/**
 *
 * @param interaction
 */
async function createStack(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.reply({
		content: "the stack!!",
		withResponse: true
	}).then((response) => {
		stackStore.set(interaction.channelId, response.resource?.message?.id as string);
	});
}

/**
 *
 * @param interaction
 */
async function run(interaction: ChatInputCommandInteraction<CacheType>) {
	// first make sure we're in a voice channel
	if (interaction.channel?.type !== ChannelType.GuildVoice) {
		await interaction.reply({
			content: "use this in a voice channel",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// is the user actually in the voice channel
	const invoker = interaction.guild?.members.cache.get(interaction.member?.user.id as string);
	if (invoker?.voice.channel?.id !== interaction.channelId) {
		await interaction.reply({
			content: "you need to be in the voice channel to use its stack",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// no stack?
	const stackId = stackStore.get(interaction.channelId);
	if (!stackId) {
		await createStack(interaction);
	} else { // stack!!
		try {
			await interaction.channel.messages.fetch(stackId).then(async (msg) => {
				await interaction.reply({
					content: `here it is ${msg.url}`,
					flags:MessageFlags.Ephemeral
				});
			});
		} catch (e) {
			// stack message was deleted and not accounted for
			stackStore.delete(interaction.channelId);
			await createStack(interaction); // making the new one
		}
	}
}
