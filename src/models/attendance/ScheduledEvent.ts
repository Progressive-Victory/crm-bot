import { Schema, model } from 'mongoose';

/** Records when scheduled events happen */
export const ScheduledEvent = model('ScheduledEvent', new Schema({
	eventId: { type: String, required: true, immutable: true },
	eventName: { type: String, required: true, immutable: true },
	scheduledStartTime: { type: Date, required: true, immutable: true },
	channelId: { type: String, required: true, immutable: true },
	logMessageChannelId: { type: String, required: true, immutable: true },
	logMessageId: { type: String, required: true, immutable: true },
	endedAt: Date,
}, { timestamps: true }));
