import {
	GuildMember,
	Snowflake,
	User,
	VoiceChannel
} from "discord.js";
import { QueueMember } from "./interface.js";

export class VoiceStack {
	speakerId: Snowflake | null = null
	lastUpdated = new Date()
	ownerId: Snowflake | null
    queue: QueueMember[] = []; // the member, and whether or not they've been marked time-sensitive

	constructor(
		owner:GuildMember | User,
		readonly channel: VoiceChannel) {
		this.ownerId = owner.id
	}

	setOwner(owner: GuildMember | User | null = null) {
		this.ownerId = owner?.id ?? null
		return this
	}

	setSpeaker(speaker: GuildMember | User | null = null ) {
		this.speakerId = speaker?.id ?? null
		return this
	}

	getMemberIndex(member: GuildMember | User) {
		return this.queue.findIndex(
			(s) => s.memberId === member.id,
		);
	}

	removeFromQueue(member: GuildMember | User) {
		const index = this.getMemberIndex(member)
		if(index !== -1) this.queue.splice(index,1)
		return this
	}

	addToQueue(member: GuildMember, priority: boolean = false) {
		this.queue.push({memberId: member.id, priority})
		return this
	}

	moveNextInQueue() {
		const nextUp = this.queue[0]
		this.queue.splice(0,1)
		return nextUp
	}

	updatePriority(member: GuildMember, priority: boolean) {
		const index = this.getMemberIndex(member)
		if(index !== -1) this.queue[index].priority = priority
		else {
			this.addToQueue(member, priority)
		}
		return this
	}

	get guild() {
		return this.channel.guild
	}
}
