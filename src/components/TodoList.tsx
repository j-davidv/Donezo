import React from 'react';
import styled from '@emotion/styled';
import { Reorder, useDragControls } from 'framer-motion';
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
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const ReorderContainer = styled(Reorder.Group)<{ theme?: 'light' | 'dark' }>`
  touch-action: pan-y;
  min-height: calc(100vh - 200px);
  padding-bottom: 100px;
`;

const EmptyState = styled.div<ThemeProps>`
  text-align: center;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  padding: 2rem;
  font-size: 1.1rem;
`;

const DragHandle = styled.div<ThemeProps>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: ${props => props.theme === 'light' ? '#999' : '#666'};
  margin-right: 8px;
  touch-action: none;
  user-select: none;
  flex-shrink: 0;

  &:before {
    content: "⋮⋮";
    font-size: 16px;
    letter-spacing: -2px;
  }

  @media (max-width: 480px) {
    margin-right: 4px;
  }

  &:active {
    cursor: grabbing;
  }
`;

const ReorderItem = styled(Reorder.Item)`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  touch-action: pan-y;
  
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const CompletedTasksContainer = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme === 'light' ? '#eee' : '#333'};
`;

const TodoItem_Draggable: React.FC<{
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
  onAddComment: (todoId: string, text: string) => Promise<void>;
  theme: 'light' | 'dark';
}> = ({ todo, onDelete, onToggle, onAddCollaborator, onRemoveCollaborator, onAddComment, theme }) => {
  const controls = useDragControls();
  
  return (
    <ReorderItem
      value={todo}
      dragListener={false}
      dragControls={controls}
    >
      <TodoItem
        todo={todo}
        onDelete={onDelete}
        onToggle={onToggle}
        onAddCollaborator={onAddCollaborator}
        onRemoveCollaborator={onRemoveCollaborator}
        onAddComment={onAddComment}
        theme={theme}
        dragHandle={
          <DragHandle 
            theme={theme}
            onPointerDown={(e: React.PointerEvent) => {
              e.preventDefault();
              controls.start(e);
            }}
          />
        }
      />
    </ReorderItem>
  );
};

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
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const handleReorder = (reorderedItems: Todo[]) => {
    // Find which item moved by comparing IDs
    for (let i = 0; i < reorderedItems.length; i++) {
      if (reorderedItems[i].id !== incompleteTodos[i]?.id) {
        // Found the moved item
        const movedItemId = reorderedItems[i].id;
        const oldIndex = incompleteTodos.findIndex(t => t.id === movedItemId);
        const newIndex = i;
        
        if (oldIndex !== newIndex) {
          onReorder(oldIndex, newIndex);
          return;
        }
      }
    }
  };

  if (todos.length === 0) {
    return (
      <EmptyState theme={theme}>
        No tasks yet. Add one to get started!
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      <ReorderContainer
        axis="y"
        values={incompleteTodos}
        onReorder={(newOrder: unknown[]) => handleReorder(newOrder as Todo[])}
        as="div"
        theme={theme}
      >
        {incompleteTodos.map((todo) => (
          <TodoItem_Draggable
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
      </ReorderContainer>

      {completedTodos.length > 0 && (
        <CompletedTasksContainer>
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
        </CompletedTasksContainer>
      )}
    </ListContainer>
  );
};

export default TodoList; 