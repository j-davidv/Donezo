import React from 'react';
import styled from '@emotion/styled';
import { Reorder } from 'framer-motion';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
  onAddComment: (todoId: string, text: string) => Promise<void>;
  theme: 'light' | 'dark';
}

interface ThemeProps {
  theme: 'light' | 'dark';
}

const ListContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyState = styled.div<ThemeProps>`
  text-align: center;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  padding: 2rem;
  font-size: 1.1rem;
`;

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onDelete,
  onToggle,
  onReorder,
  onAddCollaborator,
  onRemoveCollaborator,
  onAddComment,
  theme,
}) => {
  // Keep track of incomplete todos in local state
  const [localIncompleteTodos, setLocalIncompleteTodos] = React.useState(todos.filter(todo => !todo.completed));
  const completedTodos = todos.filter(todo => todo.completed);

  // Update local state when todos prop changes
  React.useEffect(() => {
    setLocalIncompleteTodos(todos.filter(todo => !todo.completed));
  }, [todos]);

  if (todos.length === 0) {
    return (
      <EmptyState theme={theme}>
        No tasks yet. Add one to get started!
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      <Reorder.Group
        axis="y"
        values={localIncompleteTodos}
        onReorder={(values) => {
          // Update local state immediately
          setLocalIncompleteTodos(values);
          
          // Find the moved item
          const movedItemId = values.find((item, index) => 
            item.id !== localIncompleteTodos[index]?.id
          )?.id;

          if (movedItemId) {
            const oldIndex = localIncompleteTodos.findIndex(t => t.id === movedItemId);
            const newIndex = values.findIndex(t => t.id === movedItemId);
            if (oldIndex !== newIndex) {
              onReorder(oldIndex, newIndex);
            }
          }
        }}
      >
        {localIncompleteTodos.map((todo) => (
          <Reorder.Item key={todo.id} value={todo} drag>
            <TodoItem
              todo={todo}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddCollaborator={onAddCollaborator}
              onRemoveCollaborator={onRemoveCollaborator}
              onAddComment={onAddComment}
              theme={theme}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Render completed todos without reordering */}
      {completedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          onToggle={onToggle}
          onAddCollaborator={onAddCollaborator}
          onRemoveCollaborator={onRemoveCollaborator}
          onAddComment={onAddComment}
          theme={theme}
        />
      ))}
    </ListContainer>
  );
};

export default TodoList; 