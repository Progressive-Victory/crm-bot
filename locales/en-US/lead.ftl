# lead


## Command
command-name = lead
command-description = Commands for leads to help manage their respective regions



region-name = region
region-description = Region Lead utilities
region-role-name = role
region-role-description = Toggle Regional Lead role
region-role-user-name = user
region-role-user-description = Target user

## VC Rename
vc-name = vc
vc-description = Manage voice channels
vc-rename-name = rename
vc-rename-description = Rename organizing voice channels
vc-rename-channel-name = channel
vc-rename-channel-description = The channel to rename
vc-rename-name-name = name
vc-rename-name-description = Name to set the channel to

vc-rename-success = Successfully renamed the channel {$channel}
vc-rename-error = Failed to rename the channel {$channel}
vc-rename-wrong-channel = You are not allowed to rename {$channel}. However, you can rename any of the following channels: {$channels}
vc-rename-Audit-Log-Rename = Channel {$name} renamed by {$tag}
vc-rename-Audit-Log-Undo = Automatic undoing of meeting channel rename

# role
role-region-mismatch = You and {$user} not in the same state
role-success-remove = Successfully removed {$role} from {$user}
role-success-add = Successfully added {$role} to {$user}
role-error = An Error ocurred adding/removing {$role}
role-AuditLog = Regional Role toggled by {tag}

## Ping
ping-name = ping
ping-description = ping role
ping-cant-send = Message Can't be sent in this {$Channel}
ping-not-no-perms = {$user} Does not have permission to send message
ping-success = Ping message has been sent {$url}
