import { Schema, model } from 'mongoose';

/** Records when people enter and leave voice channels */
export const VoiceSession = model('VoiceSession', new Schema({
	userId: { type: String, required: true, immutable: true },
	displayName: { type: String, required: true, immutable: true },
	channelId: { type: Number, required: true, immutable: true },
	endedAt: Date,
}, { timestamps: true }));

/** Records when scheduled events happen */
export const ScheduledEvent = model('ScheduledEvent', new Schema({
	eventId: { type: String, required: true, immutable: true },
	eventName: { type: String, required: true, immutable: true },
	endedAt: Date,
	logMessage: String,
}, { timestamps: true }));

/** Records when people select the interested button on a scheduled event */
export const ScheduledEventInterest = model('ScheduledEventInterest', new Schema({
	userId: { type: String, required: true, immutable: true },
	displayName: { type: String, required: true, immutable: true },
	eventId: { type: String, required: true, immutable: true },
	eventName: { type: String, required: true, immutable: true },
	endedAt: Date,
}, { timestamps: true }));
