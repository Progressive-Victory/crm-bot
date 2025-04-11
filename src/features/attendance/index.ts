import { Schema, model } from 'mongoose';

export const VoiceSession = model('VoiceSession', new Schema({
	userId: { type: String, required: true },
	displayName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));

export const ActivatedEvent = model('ActivatedEvent', new Schema({
	eventId: { type: String, required: true },
	eventName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));

export const ScheduledEventInterest = model('ScheduledEventInterest', new Schema({
	userId: { type: String, required: true },
	displayName: { type: String, required: true },
	eventId: { type: String, required: true },
	eventName: { type: String, required: true },
	endedAt: Date,
}, { timestamps: true }));
