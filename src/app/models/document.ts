export interface Category {
  id: number;
  name: string; //este 2
}

export interface Status {
  id: string;
  name: string;
  key: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
}

export interface sender_department {
  id: number,
  name: string,
}
export interface receiver_department {
  id: number,
  name: string,
}

export interface Document {
  id: string; // UUID en formato string
  title: string;
  reference_number: string;
  description: string;
  created_by: number;
  category_id: number;
  status_id: number;
  sender_department_id: number;
  receiver_department_id: number;
  issue_date: string; // Formato YYYY-MM-DD
  received_date: string; // Formato YYYY-MM-DD
  created_at: string; // Formato ISO con zona horaria
  updated_at: string | null;
  category: Category; // Relación con categoría
  status: Status; // Relación con estado
  sender_department: Department; // Relación con el departamento remitente
  receiver_department: Department; // Relación con el departamento receptor
  user: User; // Relación con el usuario creador del documento
}

export interface ApiResponse {
  document: Document;
}
