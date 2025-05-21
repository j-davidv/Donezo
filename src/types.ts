export interface Todo {
  id: string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
}

export interface TodoFormData {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
} 