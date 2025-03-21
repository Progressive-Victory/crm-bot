import { Guild, GuildMember, Snowflake } from 'discord.js';
import { FilterQuery, FlatRecord, HydratedDocument, Model, Schema, model } from 'mongoose';

interface IWarn {
    guildId: Snowflake,
    targetDiscordId: Snowflake,
	moderatorDiscordId: Snowflake,
    updaterDiscordId?: Snowflake,
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
        moderatorDiscordId: {
			type: String,
			required: true,
			immutable: true
		},
        updaterDiscordId: {
			type: String,
			required: false
		},
        reason: {
			type: String,
			required: true,
			default: noReason
		},
        expireAt: {
			type: Date,
			required: true,
			setDate
		},
        updatedAt: {
			type: Date,
			required: true
		},
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
            createWarning(target:GuildMember, officer:GuildMember, reason?: string, days?: number) {
                return this.create({
                    guildId: target.guild.id,
                    targetId: target.id,
                    officerId: officer.id,
                    reason: reason,
                    expireAt: setDate(days),
                });
            },
			/**
			 * 
			 * @param member 
			 * @param expireAfter 
			 * @returns 
			 */
            getWarns(member:GuildMember, expireAfter?:Date) {
                const { guild, id } = member;
                const filter: FilterQuery<FlatRecord<IWarn>> = { guildId: guild.id, targetId: id };

                if (expireAfter) {filter.expireAt = { $gte: expireAfter }; }

                return this.find(filter);
            },
			/**
			 * 
			 * @param guild 
			 * @param expireAfter 
			 * @returns 
			 */
            getWarnsInGuild(guild:Guild, expireAfter?:Date) {
                const { id } = guild;
                const filter: FilterQuery<FlatRecord<IWarn>> = { guildId: id };

                if (expireAfter) {filter.expireAt = { $gte: expireAfter }; }

                return this.find(filter);
            },
			/**
			 * 
			 * @param officer 
			 * @param expireAfter 
			 * @returns 
			 */
            getWarnsOfOfficer(officer:GuildMember, expireAfter?:Date) {
                const { guild, id } = officer;
                const filter: FilterQuery<FlatRecord<IWarn>> = { guildId: guild.id, officerId: id };

                if (expireAfter) {filter.expireAt = { $gte: expireAfter }; }

                return this.find(filter);
            },
        },
    });

export const Warn = model<IWarn, WarnModel>('Warn', warn, 'warnings');

/**
 *
 * @param days number of days to set the date
 * @returns New Date
 */
function setDate(days:number = 90) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}
