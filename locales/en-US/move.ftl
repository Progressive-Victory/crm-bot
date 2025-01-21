## builder
name = move
description = Moves members from one VC to another
option_destination_name = destination
option_destination_description = Channel where members will be move to
option_everyone_name = everyone
option_everyone_description = Do you want to move everyone in the VC

## run
reply_must_be_in_channel = You must be in a voice channel to use this command
reply_must_be_different_channel = Members are already in {$destination}
reply_moved_everyone = All members have been moved to {$destination}
reply_select_members = Select the members you would like to move:
 {-sh} Users out side of {$source} will not be moved
menu_select_placeholder = Select Members
reply_moved = All Selected members have been moved to {$destination}
