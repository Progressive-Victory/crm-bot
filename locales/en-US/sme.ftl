# sme-role exporter
## builder
command-name = sme-role-toggle
command-description = Assign the SME-role to given member
options-role = sme-role
options-role-description = Which role for the sme title
options-user = target 
options-user-description = Choose a user for the sme role

## code
auditlog-add = {$role} has been added by {$member}
auditlog-remove = {$role} has been removed by {$member}

sucess-add = {$role} has been added to {$target}!
sucess-remove = {$role} has been removed from {$target}.

not-sme-role = The role {$role} is not an SME role.
