import { Events,  Guild,  GuildMember } from "discord.js";
import Event from "../../Classes/Event.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import { stateNames } from "../../util/states/types.js";

export const guildMemberAdd = new Event({
	name: Events.GuildMemberAdd,
	execute: async (member) => {

		mongoose.connection.on('error', err => {
  			console.error('MongoDB connection error:', err);
		});
		let state = trySetStateFromZipCode(member) // TODO what if user doesn't exist on server

		member.client.emit(Events.Debug, `user ${member.id} "${member.user.username}"  joined at ${member.joinedTimestamp} to state role ${state}`);
	}
})





//source https://simple.wikipedia.org/wiki/List_of_ZIP_Code_prefixes 
async function trySetStateFromZipCode(member:GuildMember){
	// find server user from member
	const user = await findUser(member)
	if (user===undefined){
		console.error("failed to fetch user info from server")
		return
	}
	//verify zip code ??
	const zipCode:string = user.zipCode
	if (zipCode.length !== 6){
		console.error("zipcode not 6 digits long")
		return 
	}
	//lookup state of zip code
	const pref = parseInt(zipCode.substring(0,3))
	const state = getStateNameFromZipPrefix(pref)
	if (state === undefined){
		console.error("zip code doesn't map to valid state")
		return 
	}
	// find role from state
	const roleId = getRoleIdFromName(state,member.guild)
	if (roleId===undefined){
		console.error(`role for state "${state}" doesn't exist`)
		return 
	}
	// set member role
	await member.roles.add(roleId)
	return roleId
}

async function findUser(member:GuildMember):Promise<{ zipCode: string; } | undefined>{
	try {
        const user = await User.findOne({}).lean();
        if (user && user.zipCode) {
            return { zipCode: user.zipCode };
        }
		console.log(user)
        return undefined;
    } catch (error) {
        console.error("Error fetching user from database:", error);
        return undefined;
    }
}

function getStateNameFromZipPrefix(pref:number):string|undefined{
	if (pref>=0 && pref<=9 && pref != 5){// puerto rico
		return stateNames.get("pr")?.name
	} else if (pref>=10 && pref<=27 || pref===55){ // massachusets
		return stateNames.get("ma")?.name
	} else if (pref>=28 && pref<=29){ // rhode island
		return stateNames.get("ri")?.name
	} else if (pref>=30 && pref<=38){ // new hampshire
		return stateNames.get("nh")?.name
	} else if (pref>=39 && pref<=49){ // maine
		return stateNames.get("me")?.name
	} else if (pref>=50 && pref<=59){ // vermont
		return stateNames.get("vt")?.name
	} else if (pref>=60 && pref<=69){ // connecticut
		return stateNames.get("ct")?.name
	} else if (pref>=70 && pref<=89){ // new jersey
		return stateNames.get("nj")?.name
	} else if (pref>=90 && pref<=99){ // foreign military bases (europe)
		return undefined
	} else if (pref>=100 && pref<=149 || pref === 5){ // new york
		return stateNames.get("ny")?.name
	} else if (pref>=150 && pref<=196){ // pennsylvania
		return stateNames.get("pa")?.name
	} else if (pref>=197 && pref<=199){ // deleware
		return stateNames.get("de")?.name
	} else if (pref===200 || pref>=202 && pref<=205 || pref === 569){ // DC
		return stateNames.get("dc")?.name
	} else if (pref===201 || pref>=220 && pref<=246){ // virginia
		return stateNames.get("va")?.name
	} else if (pref>=206 && pref<=219){ // maryland  
		return stateNames.get("md")?.name
	} else if (pref>=247 && pref<=269){ // west virginia
		return stateNames.get("wv")?.name
	} else if (pref>=270 && pref<=289){ // north carolina
		return stateNames.get("nc")?.name
	} else if (pref>=290 && pref<=299){ // sourth carolina
		return stateNames.get("sc")?.name
	} else if (pref>=300 && pref<=319 || pref>=398 && pref<=399){ // georgia
		return stateNames.get("ga")?.name
	} else if (pref>=320 && pref<=349){ // florida
		return stateNames.get("fl")?.name
	} else if (pref>=350 && pref<=369){ // alabama
		return stateNames.get("al")?.name
	} else if (pref>=370 && pref<=385){ // tennessee
		return stateNames.get("tn")?.name
	} else if (pref>=386 && pref<=397){ // mississippi
		return stateNames.get("ms")?.name
	} else if (pref>=400 && pref<=429){ // kentucky
		return stateNames.get("ky")?.name
	} else if (pref>=430 && pref<=459){ // ohio
		return stateNames.get("oh")?.name
	} else if (pref>=460 && pref<=479){ // indiana
		return stateNames.get("in")?.name
	} else if (pref>=480 && pref<=499){ // michigan
		return stateNames.get("mi")?.name
	} else if (pref>=500 && pref<=529){ // iowa
		return stateNames.get("ia")?.name
	} else if (pref>=530 && pref<=549){ // wisconsin 
		return stateNames.get("wi")?.name
	} else if (pref>=550 && pref<=567){ // minnesota
		return stateNames.get("mn")?.name
	} else if (pref>=570 && pref<=579){ // south dakota
		return stateNames.get("sd")?.name
	} else if (pref>=580 && pref<=589){ // north dakota
		return stateNames.get("nd")?.name
	} else if (pref>=590 && pref<=599){ // montana
		return stateNames.get("mt")?.name
	} else if (pref>=600 && pref<=629){ // illinois
		return stateNames.get("il")?.name
	} else if (pref>=630 && pref<=659){ // missouri
		return stateNames.get("mo")?.name
	} else if (pref>=660 && pref<=679){ // kansas
		return stateNames.get("ks")?.name
	} else if (pref>=680 && pref<=699){ // nebraska
		return stateNames.get("ne")?.name
	} else if (pref>=700 && pref<=715){ // louisiana
		return stateNames.get("la")?.name
	} else if (pref>=716 && pref<=729){ // arkansas
		return stateNames.get("ar")?.name
	} else if (pref>=730 && pref<=749 && pref != 733){ // oklahoma
		return stateNames.get("ok")?.name
	} else if (pref === 733 || pref>=750 && pref<=799 || pref === 885){ // texas
		return stateNames.get("tx")?.name
	} else if (pref>=800 && pref<=819){ // colorado
		return stateNames.get("co")?.name
	} else if (pref>=820 && pref<=831){ // wyoming
		return stateNames.get("wy")?.name
	} else if (pref>=832 && pref<=839){ // idaho
		return stateNames.get("id")?.name
	} else if (pref>=840 && pref<=849){ // utah
		return stateNames.get("ut")?.name
	} else if (pref>=850 && pref<=869){ // arizona
		return stateNames.get("az")?.name
	} else if (pref>=870 && pref<=884){ // new mexico
		return stateNames.get("nm")?.name
	} else if (pref>=890 && pref<=899){ // nevada
		return stateNames.get("nv")?.name
	} else if (pref>=900 && pref<=961){ // california
		return stateNames.get("ca")?.name
	} else if (pref>=962 && pref<=966){ // more military bases (asia)
		return undefined
	} else if (pref>=967 && pref<=968){ // hawaii
		return stateNames.get("hi")?.name
	} else if (pref===969){ // guam & other misc pacific islands
		return undefined
	} else if (pref>=970 && pref<=979){ // oregon
		return stateNames.get("or")?.name
	} else if (pref>=980 && pref<=994){ // washington
		return stateNames.get("wa")?.name
	} else if (pref>=995 && pref<=999){ // alaska
		return stateNames.get("ak")?.name
	} else {
		return undefined
	}
}

function getRoleIdFromName(name:string,guild:Guild):string|undefined{
	for (const[roleId,role] of guild.roles.cache){
		if (name===role.name){
			return roleId
		}
	}
	return undefined
}

