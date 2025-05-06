import { Schema, model } from 'mongoose';

/** Records when scheduled events happen */
export const ScheduledEvent = model('ScheduledEvent', new Schema({
	eventId: { type: String, required: true, immutable: true },
	eventName: { type: String, required: true, immutable: true },
	endedAt: Date,
	logMessage: String,
}, { timestamps: true }));
