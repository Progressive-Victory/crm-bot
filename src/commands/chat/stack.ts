import { CacheType, ChannelType, ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { StackBox, stackStore } from '../../features/stackbox.js';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName("stack")
		.setDescription("Talking over people wouldn't be very dark woke of you")
	)
	.setExecute(run);



/**
 *
 * @param interaction The interaction fed to the bot
 * @param invoker The owner of the interaction
 */
async function createStack(interaction: ChatInputCommandInteraction, invoker: GuildMember) {
	const theStack = new StackBox(interaction, invoker);
	theStack.run().then(() => stackStore.delete(interaction.channelId));
	await interaction.reply({content: "stack created!", flags: MessageFlags.Ephemeral});
}

/**
 *
 * @param interaction The interaction fed to the bot
 */
async function run(interaction: ChatInputCommandInteraction<CacheType>) {
	const invoker = await interaction.guild!.members.fetch(interaction.user.id);

	// first make sure we're in a voice channel
	if (interaction.channel?.type !== ChannelType.GuildVoice) {
		await interaction.reply({
			content: "use this in a voice channel",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// is the user actually in the voice channel
	// const invoker = interaction.guild?.members.cache.get(interaction.member?.user.id as string);
	if (invoker.voice.channel?.id !== interaction.channelId) {
		await interaction.reply({
			content: "you need to be in the voice channel to use its stack",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// no stack?
	const theStack = stackStore.get(interaction.channelId);
	if (!theStack) {
		await createStack(interaction, invoker);
	} else { // stack!!
		try {
			interaction.channel.messages.fetch(theStack.message!.id).then(async (msg) => {
				interaction.reply({
					content: `here it is ${msg.url}`,
					flags:MessageFlags.Ephemeral
				});
			});
		} catch {
			// stack message was deleted and not accounted for
			stackStore.delete(interaction.channelId);
			await createStack(interaction, invoker); // making the new one
		}
	}
}
