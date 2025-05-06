import { Schema, model } from 'mongoose';

/** Records when people enter and leave voice channels */
export const VoiceSession = model('VoiceSession', new Schema({
	userId: { type: String, required: true, immutable: true },
	displayName: { type: String, required: true, immutable: true },
	channelId: { type: Number, required: true, immutable: true },
	endedAt: Date,
}, { timestamps: true }));
