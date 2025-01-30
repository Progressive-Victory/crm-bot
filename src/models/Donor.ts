import { Schema, model } from "mongoose";

const DonorSchema = new Schema({
  discordID: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  lastDonated: {
    type: Date,
    required: true,
  },
  lastAmount: {
    type: Number,
    required: true,
  },
});

const Donor = model("Donor", DonorSchema, "donors");

export default Donor;
