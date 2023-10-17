# sme-role exporter
## builder
command-name = alterna-rol-sme
command-description = Assignar el rol de SME al membre indicat
options-role = rol-sme
options-role-description = Cual rol para el titulo de sme
options-user = objetivo
options-user-description = Elege un usuario para el rol de sme

## code
auditlog-add = {$role} ha sido agregado por {$member}
auditlog-remove = {$role} ha sido eliminado por {$member}

sucess-add = {$role} ha sido agregado a {$target}!
sucess-remove = {$role} ha sido eliminado de {$target}.

not-sme-role = El rol {$role} no es un rol de SME.
