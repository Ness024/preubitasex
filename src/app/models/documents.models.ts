// Tipos de estado
export type DocumentStatus =
  'received' | 'in_process' | 'in_signing' | 'in_signed' |
  'completed' | 'delivered' | 'archived' | 'cancelled' | 'reopened';

// Interfaz para datos de formulario de estado
export interface StatusFormData {
  status_id: DocumentStatus;
  comment?: string;
  form: {
    received_by?: string;
    received_date?: string;
    responsible?: string;
    department?: string;
    description?: string;
    sent_to?: string;
    position?: string;
    deadline_date?: string;
    concluded_by?: string;
    signing_date?: string;
    conclusion_notes?: string;
    archived_by?: string;
    archived_date?: string;
    delivered_by?: string;
    delivery_to?: string;
    delivery_date?: string;
    cancellation_reason?: string;
    cancellation_date?: string;
    [key: string]: any;
  };
}

// Interfaz para el historial de estados
export interface DocumentStatusHistory {
  id: string;
  status: DocumentStatus;
  date: string;
  completed: boolean;
  active: boolean;
  details: {
    [key: string]: any;
  };
  relatedDocuments?: RelatedDocument[];
}

// Interfaz para documentos relacionados
export interface RelatedDocument {
  id: string;
  name: string;
  type: string;
  size?: string;
  icon: string;
  color: string;
  url?: string;
  createdAt: string;
}

// Interfaz para departamentos
export interface Department {
  id: string;
  name: string;
}

// Configuración de estados
export interface StatusConfig {
  id: DocumentStatus;
  name: string;
  color: string;
  icon: string;
  tooltip: string;
  formFields: string[];
  requiredFields: string[];
}
