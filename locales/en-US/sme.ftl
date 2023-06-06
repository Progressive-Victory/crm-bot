## sme-role exporter 
command-name = sme-role-exporter
command-description = Assign the SME-role to given member
sme-role = sme-{$roles}
options-role = target role
role-description = which role for the sme title
options-user = target user 
user-description = choose a user for the sme role
auditlog-add = {$smeName} has been added from {$member}.
auditlog-remove ={$smeName} has been removed form {$member}.