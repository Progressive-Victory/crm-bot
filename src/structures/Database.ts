import { Client, Logger } from '@Client';
import {
	Guild, Role, Snowflake 
} from 'discord.js';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();
const client = new MongoClient(process.env.DB_URI);

export default class Database {
	static get client() {
		return client;
	}

	static get db() {
		return this.client.db('bot');
	}

	static async connect() {
		await this.client.connect();
		await this.db.command({ ping: 1 });
		Logger.info('Database connected successfully!');
	}

	static addLeave(userID: Snowflake, guildID: Snowflake) {
		return Database.db.collection('leaves').insertOne({
			userID,
			guildID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static addJoin(userID: Snowflake, guildID: Snowflake) {
		return Database.db.collection('joins').insertOne({
			userID,
			guildID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static incrementMessages(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('messages').updateOne(
			{
				userID,
				guildID,
				channelID
			},
			{
				$inc: { count: 1 },
				$set: { updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
	}

	static addVCJoin(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('vcjoins').insertOne({
			userID,
			guildID,
			channelID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static addVCLeave(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('vcleaves').insertOne({
			userID,
			guildID,
			channelID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static async getMetrics(guildID: Snowflake, userID?: Snowflake) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const query: any = { guildID };
		if (userID) query.userID = userID;

		const [joins, leaves, messagesList, vcJoins, vcLeaves] = await Promise.all([
			Database.db.collection('joins').find(query).toArray(),
			Database.db.collection('leaves').find(query).toArray(),
			Database.db.collection('messages').find(query).toArray(),
			Database.db.collection('vcjoins').find(query).toArray(),
			Database.db.collection('vcleaves').find(query).toArray()
		]);

		const messages = userID ? messagesList.find((row) => row.userID === userID)?.count : messagesList;

		return {
			messages,
			joins,
			leaves,
			vcJoins,
			vcLeaves
		};
	}

	static getPastDate(duration: number) {
		const pastDate = new Date();
		pastDate.setTime(pastDate.getTime() - duration);
		return pastDate;
	}

	/**
	 * Sets the timed role for the user
	 * @param userID The user ID to set the role for
	 * @param guild The server
	 * @param role The role that was assigned
	 * @param duration The duration in milliseconds. The default is one month outside of the testing environment.
	 * @returns {Promise<void>}
	 */
	static async addTimedRole(userID: Snowflake, guild: Guild, role: Role, duration?: number): Promise<void> {
		// 30 days in milliseconds: 30 * 24 * 60 * 60 * 1000
		// 1 hour in milliseconds: 60 * 60 * 1000
		const defaultDuration = process.env.ENV === 'test' ? 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
		const actualDuration = duration ?? defaultDuration;

		await Database.db.collection('timedRoles').insertOne({
			userID,
			guildID: guild.id,
			roleID: role.id,
			createdAt: new Date(),
			duration: actualDuration
		});
	}

	static async removeExpiredRoles(bot: Client) {
		const expiredRoles = await Database.db.collection('timedRoles').find().toArray();

		for (const {
			userID, guildID, roleID, createdAt, duration 
		} of expiredRoles) {
			const expirationDate = new Date(createdAt);
			expirationDate.setTime(expirationDate.getTime() + duration);

			if (new Date() >= expirationDate) {
				const guild = await bot.guilds.fetch(guildID);
				const member = await guild.members.fetch(userID);
				const role = await guild.roles.fetch(roleID);

				if (role && member.roles.cache.has(role.id)) {
					Logger.debug(`Removing role ${role.name} from ${member.user.tag} (${member.id})`);

					try {
						await member.roles.remove(role);
						await Database.db.collection('timedRoles').deleteOne({
							userID,
							guildID,
							roleID
						});
					}
					catch (e) {
						Logger.error('Failed to remove role', e);
					}
				}
			}
		}
	}
}
