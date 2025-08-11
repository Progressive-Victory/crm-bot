import { Snowflake } from "discord.js";
import mongoose, { Model, Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  teamRole: Snowflake;
  leaderRole: Snowflake;
}

const teamSchema = new Schema<ITeam>({
  name: { type: String },
  teamRole: { type: String },
  leaderRole: { type: String },
});

const modelName = "Team";

export const Team: Model<ITeam> =
  (mongoose.models as Record<string, Model<ITeam>>).Team ||
  mongoose.model<ITeam>(modelName, teamSchema);

export default Team;
