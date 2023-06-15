# sme-role exporter
## builder
command-name = sme-role-toggle
command-description = Assign the SME-role to given member
options-role = sme-role
options-role-description = Which role for the sme title
options-user = target 
options-user-description = Choose a user for the sme role

## code
auditlog-add = {$smeRole} has been added by {$member}
auditlog-remove = {$smeRole} has been removed by {$member}

sucess-add = {$smeRole} has been added to {$target}
sucess-remove = {$smeRole} has been removed from {$target}

not-sme-role = The role {$role} is to an SME role