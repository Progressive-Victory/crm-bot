import { Collection, ContainerBuilder, GuildMember, heading, InteractionReplyOptions, MessageFlags, Snowflake, subtext, TextDisplayBuilder, userMention, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { row } from "./buttons.js";
import { VoiceStack } from "./stackbox.js";

const containerColor = 0x7289da;

export class StackManager {

	stacks = new Collection<Snowflake, VoiceStack>();

	create(channel: VoiceChannel, member: GuildMember) {
		const theStack = new VoiceStack(member, channel);
		this.stacks.set(channel.id, theStack);
		return theStack;
	}

	remove(channel: VoiceBasedChannel) {
		this.stacks.delete(channel.id);
		return this;
	}

	render(channel: VoiceBasedChannel):InteractionReplyOptions {
		const stack = this.stacks.get(channel.id);
		if(!stack) throw new Error('Stack does not exist')

		let ownerString: string
		if(stack.ownerId) ownerString = userMention(stack.ownerId)
		else ownerString = 'Unowned'

		const bodyArray = [
				heading(`${channel.name} VC Queue`),
				'The queue is to help you know who is next up to speak\n',
				`Current Speaker: ${stack.speakerId ? userMention(stack.speakerId) : 'No Speaker'}\n`,
			]
		if (stack.queue.length === 0) {
			bodyArray.push('- No Other members in queue')
		} else {
			const inline = stack.queue.map<string>((qm) => {
				return `- ${userMention(qm.memberId)}${qm.priority ? ' ⏰' : ''}`
			})
			bodyArray.concat(inline)
		}
		bodyArray.push('\n' + subtext(`Owner of queue: ${ownerString}`))

		const body = new TextDisplayBuilder().setContent(bodyArray.join('\n'))

		const container = new ContainerBuilder()
		.setAccentColor(containerColor)
			.addTextDisplayComponents(body)
			.addActionRowComponents(row)

		return {
			components:[
				container
			],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {}
		}
	}
}
