export const FORM_ERROR_MESSAGES = {
    required: 'Este campo es requerido',
    received_by: {
        required: 'Debe especificar quien recibió el documento',
        minlength: 'El nombre debe tener al menos 3 caracteres'
    },
    received_date: {
        required: 'La fecha de recepción es obligatoria'
    },
    responsible: {
        required: 'Debe especificar un responsable para el trámite',
        maxlength: 'El nombre debe tener menos de 255 caracteres',
    },
    department: {
        required: 'Debe seleccionar un departamento'
    },
    description: {
        required: 'Debe proporcionar una descripción del trámite'
    },
    sent_to: {
        required: 'Debe especificar a quien se envió el documento para firma'
    },
    position: {
        required: 'Debe especificar el cargo o posición de la persona que firma'
    },
    deadline_date: {
        required: 'Debe establecer una fecha límite para la firma'
    },
    signed_by: {
        required: 'Debe especificar quien concluyó el trámite'
    },
    signing_date: {
        required: 'La fecha de firma es obligatoria'
    },
    concluded_by: {
        required: 'Debe especificar quien concluyó el trámite'
    },
    conclusion_date: {
        required: 'La fecha de conclusión es obligatoria'
    },
    archived_by: {
        required: 'Debe especificar quien archivó el documento'
    },
    archived_date: {
        required: 'La fecha de archivo es obligatoria'
    },
    delivered_by: {
        required: 'Debe especificar quien entregó el documento'
    },
    delivery_to: {
        required: 'Debe especificar a quien se entregó el documento'
    },
    delivery_date: {
        required: 'La fecha de entrega es obligatoria'
    },
    cancellation_reason: {
        required: 'Debe proporcionar un motivo para la cancelación'
    },
    cancellation_date: {
        required: 'La fecha de cancelación es obligatoria'
    },
    reference_number: {
        required: 'El número de referencia es obligatorio',
        maxlength: 'El número de referencia no puede tener más de 255 caracteres'
    },
    title: {
        required: 'El asunto es obligatorio',
        maxlength: 'El asunto no puede tener más de 255 caracteres'
    },
    category_id: {
        required: 'El tipo de documento es obligatorio'
    },
    status_id: {
        required: 'El status es obligatorio'
    },
    issue_date: {
        required: 'La fecha de elaboración es obligatoria'
    },
    sender_department_id: {
        required: 'El departamento remitente es obligatorio'
    },
    new_sender_department: {
        required: 'El nuevo departamento remitente es obligatorio'
    },
    receiver_department_id: {
        required: 'El departamento receptor es obligatorio'
    },
    name: {
        required: 'El nombre es obligatorio',
        maxlength: 'El nombre no puede tener más de 255 caracteres'
    },
    username: {
        required: 'El nombre de usuario es obligatorio',
        maxlength: 'El nombre de usuario no puede tener más de 30 caracteres',
        minlength: 'El nombre de usuario debe tener al menos 5 caracteres'
    },
    password: {
        required: 'La contraseña es obligatoria',
        maxlength: 'La contraseña no puede tener más de 30 caracteres',
        minlength: 'La contraseña debe tener al menos 8 caracteres'
    },
    role: {
        required: 'Seleccione un rol'
    },
    permissions: {
        required: 'Seleccione al menos un permiso (por ejemplo: "Leer")'
    },
    new_password: {
        required: 'La contraseña nueva es obligatoria',
        maxlength: 'La contraseña nueva no puede tener más de 30 caracteres',
        minlength: 'La contraseña nueva debe tener al menos 8 caracteres'
    },
    current_password: {
        required: 'La contraseña actual es obligatoria por seguridad',
        maxlength: 'La contraseña actual no puede tener más de 30 caracteres',
        minlength: 'La contraseña actual debe tener al menos 8 caracteres'
    },
    new_password_confirmation: {
        required: 'Confirma que la contraseña nueva sea correcta',
        maxlength: 'La contraseña nueva no puede tener más de 30 caracteres',
        minlength: 'La contraseña nueva debe tener al menos 8 caracteres',
        mismatch: 'Las contraseñas no coinciden'
    }
}