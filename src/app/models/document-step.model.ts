// document-step.model.ts
export interface DocumentStep {
  id: string;
  status: 'received' | 'in_process' | 'in_signing' | 'in_signed' | 'completed' | 'delivered' | 'archived' | 'cancelled' | 'reopened';
  title: string;
  date: string;
  isCurrent: boolean;
  steps: string;
  details: {
    receivedBy?: string;
    responsible?: string;
    department?: string;
    sentTo?: string;
    position?: string;
    deadlineDate?: string;
    // ... otros campos según necesidad
  };
  relatedDocuments?: {
    id: string;
    name: string;
    type: string;
    icon: string;
    url?: string;
  }[];
}
