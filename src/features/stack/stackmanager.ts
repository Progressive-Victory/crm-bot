import { Collection, GuildMember, Snowflake, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { Client } from "../../Classes/index.js";
import { UpdateStackOptions } from "./interface.js";
import { StackBox } from "./stackbox.js";

export class StackManger {

	stacks = new Collection<Snowflake, StackBox>()

	constructor(readonly client:Client) {
		
	}

	create(channel: VoiceBasedChannel, member:GuildMember) {
		const theStack = new StackBox(channel, member);
		theStack.createMessage()
		this.stacks.set(channel.id, theStack);
		return theStack
	}

	remove(channel: VoiceBasedChannel) {
		this.stacks.delete(channel.id)
		return this
	}
	
	update(channel: VoiceBasedChannel, options: UpdateStackOptions) {
		const stack = this.stacks.get(channel.id)
		if(!stack) throw Error('Stack does not exist')
		
		if(options.owner) stack.owner = options.owner
		if(options.add) stack.speakerQueue.push(options.add)
		if(options.remove && options.remove >= 0) stack.speakerQueue.splice(options.remove, 1)
		
		this.stacks.set(channel.id,stack)

		return stack.editMessage()
	}

	render(channel: VoiceChannel) {
		const stack = this.stacks.get(channel.id)
		if (!stack) throw Error('No stack exists')
		if(!stack.message) stack.createMessage()
		else stack.editMessage()
	}
}
