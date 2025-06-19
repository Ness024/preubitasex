// models/forms.model.ts

export interface FormReceived {
  received_by: string;
  received_date: string;
}

export interface FormInProcess {
  department: string;
  description: string;
  responsible: string;
}

export interface FormInSigning {
  sent_to: string;
  position: string;
  deadline_date: string;
}

export interface FormSigned {
  concluded_by: string;
  signing_date: string;
  conclusion_notes: string;
}

export interface FormCompleted {
  concluded_by: string;
  conclusion_date: string;
  conclusion_notes: string;
}

export interface FormDelivered {
  delivery_to: string;
  delivered_by: string;
  delivery_date: string;
  delivery_notes?: string;
}

export interface FormArchived {
  archived_by: string;
  archived_date: string;
  archived_file_location: string;
}

export interface FormCancelled {
  cancellation_date: string;
  cancellation_notes: string;
  cancellation_reason: string;
}

// Tipo unión para todos los forms
export type DocumentForm =
  | FormReceived
  | FormInProcess
  | FormInSigning
  | FormSigned
  | FormCompleted
  | FormDelivered
  | FormArchived
  | FormCancelled;
