// models/document-history.model.ts
import { DocumentForm } from './forms.model';
import { Status } from "./document";
import { StatusKey } from '../shared/constants/status.constants';

export interface DocumentHistoryItem {
  id: number;
  document_id: string;
  status_id: number;
  comment: string | null;
  form: DocumentForm;
  created_at: string;
  updated_at: string;
  status: Status;

  isStatus?: (key: StatusKey) => boolean;
}

export interface DocumentHistoryResponse {
  message: string;
  data: DocumentHistoryItem[];
  related_documents?: Document[];
}

export function isFormType<T extends DocumentForm>(
  item: DocumentHistoryItem,
  type: new () => T
): item is DocumentHistoryItem & { form: T } {
  return item.form instanceof type;
}
