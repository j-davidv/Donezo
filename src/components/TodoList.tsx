import React from 'react';
import styled from '@emotion/styled';
import { motion, Reorder } from 'framer-motion';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
}

const ListContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
  font-size: 1.1rem;
`;

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onUpdate,
  onDelete,
  onToggle,
  onReorder,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  if (todos.length === 0) {
    return (
      <EmptyState>
        No tasks yet. Add one to get started!
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      <Reorder.Group
        axis="y"
        values={todos}
        onReorder={(values) => {
          const startIndex = todos.findIndex(todo => todo.id === values[0].id);
          const endIndex = 0;
          onReorder(startIndex, endIndex);
        }}
      >
        {todos.map((todo) => (
          <Reorder.Item key={todo.id} value={todo}>
            <TodoItem
              todo={todo}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddCollaborator={onAddCollaborator}
              onRemoveCollaborator={onRemoveCollaborator}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </ListContainer>
  );
};

export default TodoList; 