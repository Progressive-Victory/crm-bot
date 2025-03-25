import { Guild, GuildMember, Snowflake } from 'discord.js';
import { HydratedDocument, Model, Schema, model } from 'mongoose';

interface IWarn {
    guildId: Snowflake,
	guildName: string
    targetDiscordId: Snowflake,
	targetUsername: string
	moderatorDiscordId: Snowflake,
	moderatorUsername: string
    updaterDiscordId?: Snowflake,
	updaterUsername?: string
    reason: string,
    expireAt: Date,
    createdAt: Date,
    updatedAt: Date,
}

export type WarningRecord = HydratedDocument<IWarn> // Document<unknown, object, IWarn> & IWarn & {_id: Types.ObjectId;}

interface WarnModel extends Model<IWarn> {
    createWarning(target:GuildMember, officer:GuildMember, reason?: string, days?: number): Promise<WarningRecord>
    getWarnsOfMember(member:GuildMember, expireAfter?:Date): Promise<WarningRecord[]>
    getWarnsInGuild(guild:Guild, expireAfter?:Date): Promise<WarningRecord[]>
    getWarnsOfOfficer(officer:GuildMember, expireAfter?:Date): Promise<WarningRecord[]>
}

const noReason = 'No Reason Given';
const warn = new Schema<IWarn, WarnModel>(
    {
        guildId: {
			type: String,
			required: true,
			immutable: true
		},
        targetDiscordId: {
			type: String,
			required: true,
			immutable: true
		},
		targetUsername: {
			type: String,
			required: true,
			immutable: true
		},
        moderatorDiscordId: {
			type: String,
			required: true,
			immutable: true
		},
		moderatorUsername: {
			type: String,
			required: true,
			immutable: true
		},
        updaterDiscordId: { type: String, required: false },
		updaterUsername : { type: String, required: false },
        reason: {
			type: String,
			required: true,
			default: noReason
		},
        expireAt: {
			type: Date,
			required: true,
			default: setDate()
		},
        updatedAt: { type: Date, default: new Date() },
    },
    {
        timestamps: true,
        statics: {
			/**
			 * Create new warning 
			 * @param target 
			 * @param officer 
			 * @param reason 
			 * @param days 
			 * @returns 
			 */
            createWarning(target:GuildMember, officer:GuildMember, reason: string, days?: number) {
                return this.create({
                    guildId: target.guild.id,
					guildName: target.guild.name,
                    targetDiscordId: target.id,
					targetUsername: target.user.username,
					moderatorDiscordId: officer.id,
					moderatorUsername: officer.user.username,
                    reason: reason,
                    expireAt: setDate(days),
                });
            }
        },
    });

export const Warn = model<IWarn, WarnModel>('Warn', warn, 'warnings');

/**
 *
 * @param days number of days to set the date
 * @returns New Date
 */
export function setDate(days:number = 90) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}
