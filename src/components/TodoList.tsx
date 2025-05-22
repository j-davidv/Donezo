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
  onEdit: (todoId: string, title: string, description: string, startTime: string, endTime: string) => Promise<void>;
  theme: 'light' | 'dark';
}

interface ThemeProps {
  theme: 'light' | 'dark';
}

const ListContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  height: 100%;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 840px) {
    max-width: 100%;
    padding: 12px;
  }
`;

const ReorderContainer = styled(Reorder.Group)<{ theme?: 'light' | 'dark' }>`
  touch-action: pan-y;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;

  @media (max-width: 480px) {
    gap: 8px;
    padding-bottom: 16px;
  }
`;

const EmptyState = styled.div<ThemeProps>`
  text-align: center;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  padding: 2rem;
  font-size: 1.1rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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
  display: flex;
  flex-direction: column;
`;

const CompletedTasksContainer = styled.div<{ theme: 'light' | 'dark' }>`
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme === 'light' ? '#eee' : '#333'};
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 4px;
    padding-top: 12px;
  }
`;

const CompletedTasksHeader = styled.div<{ theme: 'light' | 'dark' }>`
  font-size: 0.9rem;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  padding: 0 4px;
  margin-bottom: 4px;
`;

const TodoItem_Draggable: React.FC<{
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
  onAddComment: (todoId: string, text: string) => Promise<void>;
  onEdit: (todoId: string, title: string, description: string, startTime: string, endTime: string) => Promise<void>;
  theme: 'light' | 'dark';
}> = ({ todo, onDelete, onToggle, onAddCollaborator, onRemoveCollaborator, onAddComment, onEdit, theme }) => {
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
        onEdit={onEdit}
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
  onEdit,
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
      <ListContainer>
        <EmptyState theme={theme}>
          No tasks yet. Add one to get started!
        </EmptyState>
      </ListContainer>
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
            onEdit={onEdit}
            theme={theme}
          />
        ))}
      </ReorderContainer>

      {completedTodos.length > 0 && (
        <CompletedTasksContainer theme={theme}>
          <CompletedTasksHeader theme={theme}>
            Completed Tasks ({completedTodos.length})
          </CompletedTasksHeader>
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddCollaborator={onAddCollaborator}
              onRemoveCollaborator={onRemoveCollaborator}
              onAddComment={onAddComment}
              onEdit={onEdit}
              theme={theme}
            />
          ))}
        </CompletedTasksContainer>
      )}
    </ListContainer>
  );
};

export default TodoList; 