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
vc-rename-permissions = I am missing manage channel permissions to rename the channel {$channel}.
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
ping-description = Ping Your State Role
ping-role-description = Role to ping, otherwise one of your state roles
ping-channel-description = Channel where the ping will be sent
ping-message-description = Message you wish to add to the ping
ping-cant-send = Message can't be sent in this {$channel}
ping-not-no-perms = {$user} does not have permission to send message
ping-success = Ping message has been sent {$url}

## Member list
### Command
member-list-name = member-list
member-list-description = Exports a list of the users in each role as a csv file
### Command Options
member-list-role-option-name = target
member-list-role-option-description = The role from with to get list

### follow-up
member-list-message-followup = Members in {$role} role

## events
### Command
event-name = events
event-description = event command
event-create-name = create
event-create-description = Create event with channels
event-update = update
event-update-description = Update permissions of event channels

### Command Options
event-option-name = name
event-option-name-description = Name of event
event-option-description = description
event-option-description-description = Description of event
event-option-date = date
event-option-date-description = Example `2024-10-05T08:00` Date must be in the future
event-option-channel = channel
event-option-channel-description = Channel for event

### replies
event-bad-date = Date is incorectly formated
event-date-past = Date entered was in the past and can not be used
event-success-create = Successfully Created, Be sure to add roles or members to the event below 
event-success-button-event = Event
event-success-button-vc = Voice Channel
event-success-button-chat = Text Channel
event-select-menu = Select Roles or members
event-select-reply = Permission Override Updated
event-channel-bad-category = Please choose a channel in the event category

