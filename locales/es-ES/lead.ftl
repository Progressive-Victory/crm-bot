# lead


## Command
command-name = lider
command-description = Comandos para líderes para ayudar a administrar sus respectivas regiones


region-name = region
region-description = Utilidades del líder de region 
region-role-name = rol
region-role-description = Alternar rol de líder regional
region-role-user-name = usuario
region-role-user-description = Usuario objetivo

## VC Rename
vc-name = chat-de-voz
vc-description = Manage voice channels
vc-rename-name = cambiar-nombre
vc-rename-description = Cambiar el nombre para los canales de voz para organizar
vc-rename-channel-name = canal
vc-rename-channel-description = EL canal para cambiar el nombre
vc-rename-name-name = nombre
vc-rename-name-description = Nombre para establecer el canal
vc-rename-success = Exitosamente cambiado el nombre del canal {$channel}
vc-rename-perrissions = Falta el permiso de administrar canales para cambiar el nombre del canal {$channel}.
vc-rename-error = No puede cambiar el nombre del canal {$channel}.
vc-rename-wrong-channel = No tienes permiso para cambiar el nombre de {$channel}. Sin embargo, puedes cambiar el nombre de cualquiera de los siguientes canales: {$channels}
vc-rename-Audit-Log-Rename = Canal {$name} renombrado por {$tag}
vc-rename-Audit-Log-Undo = Automatic undoing of meeting channel rename
vc-rename-Audit-Log-Undo = Deshacer automáticamente el cambio de nombre del canal de sesion

# role
role-region-mismatch = Usted y {$user} no están en el mismo estado
role-success-remove = Exitosamente eliminado {$role} de {$user}
role-success-add = Exitosamente agregado {$role} a {$user}
role-error = Ocurrió un error al agregar / eliminar {$role}
role-AuditLog = rol regional alternado por {tag}

## Ping
# a note: there is no word for "ping" or "to ping" in spanish so I used the word "notification" and "to notify" instead 
ping-name = notificar
ping-description = Notificar a tu rol de estado
ping-role-description = Rol para notificar, de lo contrario uno de tus roles de estado
ping-channel-description = Canal donde se enviará el notificación
ping-message-description = Mensaje que desea agregar al notificación
ping-cant-send = Mensaje no se puede enviar en {$channel}
ping-not-no-perms = {$user} no tiene permiso para enviar mensajes
ping-success = Mensaje de notificación enviado {$url}

## Member list
### Command
member-list-name = lista-de-miembros
member-list-description = Exporta una lista de los usuarios en cada rol como un archivo CSV
### Command Options
member-list-role-option-name = objetivo
member-list-role-option-description = El rol del que obtener la lista


### follow-up
member-list-message-followup = Miembros en el rol {$role}

## events
### Command
event-name = evento
event-description = Comandos para eventos
event-create-name = crear
event-create-description = Crea evento con canales
event-update = actualizar
event-update-description = Actualiza los permisos de los canales del evento

### Command Options
event-option-channel = canal
event-option-channel-description = canal para eventos

### replies
event-bad-date = La fecha no está en el formato correcto
event-date-past = La fecha ingresada estaba en el pasado y no se puede usar
event-success-create = Exitosamente creado, asegúrese de agregar roles o miembros al evento a continuación.
event-success-button-event = Evento
event-success-button-vc = Canal de voz
event-success-button-chat = Canal de texto
event-select-menu = Seleccionar roles o miembros
event-select-reply = Permiso de anulación actualizado
event-channel-bad-category = Por favor, elija un canal en la categoría de eventos

### Event Modals
modal-title-event-create = Crear Evento
modal-label-event-create-name = Nombre
modal-placeholder-event-create-name = Nombre del Evento
modal-label-event-create-description = Descripción
modal-placeholder-event-create-description = Descripción del Evento
modal-label-event-create-date = Fetcha
modal-placeholder-event-create-date = YYYY-MM-DD
modal-label-event-create-time = Tiempo(EST)
modal-placeholder-event-create-time = HH:MM

## Log Message
log-message-reply = Registro generado
log-message-name = mensajes-de-registro
log-message-description = Generar archivo TXT del contenido del mensaje
log-message-channel = canal
log-message-channel-description = Canal Objetivo
