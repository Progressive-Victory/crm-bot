# sme-role exporter
## builder
command-name = sme-role-exporter
command-description = Assign the SME-role to given member
options-role = sme-role
options-role-description = Which role for the sme title
options-user = target 
options-user-description = Choose a user for the sme role

## code
auditlog-add = {$semRole} has been added by {$member}.
auditlog-remove = {$smeRole} has been removed by {$member}.


not-sme-role = The role {$role} is to an SME role