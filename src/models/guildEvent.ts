import { GuildScheduledEventStatus, Snowflake } from "discord.js"
import { HydratedDocument, model, Model, Schema } from "mongoose"

interface Sessions {
	sessionId: string
	joinedAt: Date,
	disconnectedAt?: Date
}

export interface IEventUsers {
	userId: Snowflake,
	voiceSession?: Sessions
}

export interface IGuildEvent {
	guildId: Snowflake
	eventId: Snowflake
	name: string,
	startAt: Date
	scheduledStart: Date
	status: GuildScheduledEventStatus
	user?: IEventUsers
	
}

type SessionsModelType = Model<Sessions>
type UsersModelType = Model<IEventUsers>
type GuildEventModelType = Model<IGuildEvent>


const voiceSession = new Schema<Sessions, SessionsModelType>({
	sessionId:{
		type:String,
		required: true,
		immutable:true,
	},
	joinedAt:{
		type:Date,
		required:true,
		default: ()=> new Date()
	},
	disconnectedAt: Date
})

const guildEventUser = new Schema<IEventUsers, UsersModelType>({
	userId: {
		type:String,
		required:true,
		immutable:true
	},
	voiceSession: voiceSession
})

const guildEvents = new Schema<IGuildEvent, GuildEventModelType>({
	guildId: {
		type:String,
		required: true,
		immutable: true
	},
	eventId: {
		type:String,
		required: true,
		immutable: true
	},
	name: { type:String, required: true },
	startAt: {
		type: Date,
		required: true,
		immutable:true,
	},
	scheduledStart: {
		type: Date,
		required:true,
		immutable:true
	},
	status: {
		type: Number,
		required: true,
		default: GuildScheduledEventStatus.Active
	},
	user: guildEventUser
},
{ timestamps: { createdAt: true, updatedAt: true } })


export type GuildEventRecord = HydratedDocument<IGuildEvent>


export const GuildEvent = model<IGuildEvent, GuildEventModelType>('guildEvent', guildEvents, 'guildEvents')
