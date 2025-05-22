export interface Comment {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
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
  order: number;
  comments: Comment[];
}

export interface TodoFormData {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface CollaboratorData {
  email: string;
  id: string;
}

export interface SavedCollaborator {
  id: string;
  email: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  name?: string;
  savedCollaborators?: SavedCollaborator[];
} 