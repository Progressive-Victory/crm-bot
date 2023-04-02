import Discord from 'discord.js';

interface Language {
    Objects: {
        Meeting: string
    }
    Generics: {
        NotImplemented: (command: string) => string
        Error: () => string
        NoRole: (name?: string) => string
        MissingConfiguration: (name?: string) => string
    }
    Permissions: {
        NoCommandPermissions: (command: string, permissions?: string[], type?: string, serverwideType?: string) => string
        BotOwners: (command: string) => string
        ServerOnly: (command: string) => string
        StateRegionMismatchUser: (user: Discord.User) => string
        StateRegionMismatchChannel: (name: string) => string
        WrongRegionChannel: (channel: Discord.Channel, allowed: string[]) => string
        TrackingServer: (command: string) => string
        MissingSMERole: (roles: string[]) => string
    }
    Commands: {
        Pin: {
            Success: (message: Discord.Message, pinned: boolean) => string
            Error: (message: Discord.Message) => string
            CannotPin: (message: Discord.Message) => string
        }
        Delete: {
            Success: (message: Discord.Message) => string
            Error: (message: Discord.Message) => string
            CannotDelete: (message: Discord.Message) => string
        }
        Lead: {
            Region: {
                Role: {
                    Success: (role: Discord.Role, user: Discord.User, add: boolean) => string
                    Error: (role: Discord.Role, user: Discord.User, add: boolean) => string
                    AuditLog: (role: Discord.Role, user: Discord.User, add: boolean) => string
                }
            },
            VC: {
                Rename: {
                    Success: (channel: Discord.VoiceChannel) => string
                    Error: (channel: Discord.VoiceChannel) => string
                    WrongChannel: (channel: Discord.VoiceChannel, allowed: string[]) => string
                    AuditLogRename: (channel: Discord.VoiceChannel, user: Discord.User) => string
                    AuditLogUndo: () => string
                }
            }
        },
        Metrics: {
            Title: () => string,
            User: () => string,
            VCJoins: () => string,
            VCLeaves: () => string,
            Messages: () => string,
            ServerJoins: () => string,
            ServerLeaves: () => string,
            ConnectedForm: () => string,
            Server: () => string,
            LeavesToMemberCount: () => string,
            UsersInServer: () => string,
            NotInServer: () => string,
            Connected: () => string,
            NotConnected: () => string
        }
    }
}

export default Language;
