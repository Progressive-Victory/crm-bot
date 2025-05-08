import { Schema, model } from 'mongoose';

/** Records when people select the interested button on a scheduled event */
export const ScheduledEventInterest = model('ScheduledEventInterest', new Schema({
	userId: { type: String, required: true, immutable: true },
	displayName: { type: String, required: true, immutable: true },
	eventId: { type: String, required: true, immutable: true },
	eventName: { type: String, required: true, immutable: true },
	endedAt: Date,
}, { timestamps: true }));
