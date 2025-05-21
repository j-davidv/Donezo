export interface Todo {
  id: string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  ownerId: string;
  sharedWith: string[];
  collaborators: {
    id: string;
    email: string;
  }[];
  lastModifiedBy?: string;
  lastModifiedAt?: number;
}

export interface TodoFormData {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
}

export interface CollaboratorData {
  email: string;
  id: string;
} 