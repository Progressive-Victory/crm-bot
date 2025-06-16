import { client } from "../../index.js";
import { StackManager } from "./stackmanager.js";

export const stacks = new StackManager(client);
