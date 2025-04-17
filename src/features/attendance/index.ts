import { Schema, model } from 'mongoose';

/** Records when people enter and leave voice channels */
export const VoiceSession = model('VoiceSession', new Schema({
	userId: { type: String, required: true },
	displayName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));

/** Records when scheduled events happen */
export const ActivatedEvent = model('ActivatedEvent', new Schema({
	eventId: { type: String, required: true },
	eventName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));

/** Records when people select the interested button on a scheduled event */
export const ScheduledEventInterest = model('ScheduledEventInterest', new Schema({
	userId: { type: String, required: true },
	displayName: { type: String, required: true },
	eventId: { type: String, required: true },
	eventName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));
