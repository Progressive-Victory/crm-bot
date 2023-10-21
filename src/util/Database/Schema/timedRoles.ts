import { Client, Logger } from 'discord-client';
import { Snowflake } from 'discord.js';
import {
	Model, Schema, model 
} from 'mongoose';

export interface ITempRole {
	userID: Snowflake;
	guildID: Snowflake;
	roleID: Snowflake;
	duration: number;
	createdAt: Date;
}

const tempRolesSchema = new Schema<ITempRole>(
	{
		userID: {
			type: String,
			required: true,
			immutable: true
		},
		guildID: {
			type: String,
			required: true,
			immutable: true
		},
		roleID: {
			type: String,
			required: true,
			immutable: true
		},
		duration: {
			type: Number,
			required: true,
			default: () => (process.env.ENV === 'test' ? 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)
		}
	},
	{
		timestamps: true,
		statics: {
			async removeExpiredRoles(client: Client): Promise<void> {
				const expiredRoles = await this.find();

				for (const roleAssignment of expiredRoles) {
					const {
						createdAt, duration, guildID, userID, roleID 
					} = roleAssignment;
					const expirationDate = new Date(createdAt.getTime() + duration);

					if (new Date() >= expirationDate) {
						const guild = await client.guilds.fetch(guildID);
						const member = await guild.members.fetch(userID);
						const role = await guild.roles.fetch(roleID);

						if (role && member.roles.cache.has(role.id)) {
							Logger.debug(`Removing role ${role.name} from ${member.user.tag} (${member.id})`);

							try {
								await member.roles.remove(role);
								await roleAssignment.deleteOne();
							}
							catch (e) {
								Logger.error('Failed to remove role', e);
							}
						}
					}
				}
			}
		}
	}
);

interface TempRoleModel extends Model<ITempRole> {
	removeExpiredRoles(client: Client): Promise<void>;
}

export const tempRoles = model('timedRoles', tempRolesSchema) as TempRoleModel;
