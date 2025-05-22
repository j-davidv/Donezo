import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Todo } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CollaboratorModal from './CollaboratorModal';
import CommentSection from './CommentSection';
import EditTodoModal from './EditTodoModal';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
  onAddComment: (todoId: string, text: string) => Promise<void>;
  onEdit: (todoId: string, title: string, description: string, startTime: string, endTime: string) => Promise<void>;
  theme: 'light' | 'dark';
  dragHandle?: React.ReactNode;
}

interface ThemeProps {
  theme: 'light' | 'dark';
}

const ItemContainer = styled(motion.div)<ThemeProps>`
  background-color: ${props => props.theme === 'light' ? '#fff' : '#2a2a2a'};
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  user-select: none;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  touch-action: pan-y;
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const MainContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 4px;
  cursor: pointer;
`;

const Content = styled.div<{ completed: boolean; theme: 'light' | 'dark' }>`
  flex: 1;
  min-width: 0;
  width: 100%;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => {
    if (props.completed) {
      return props.theme === 'light' ? '#999' : '#666';
    }
    return props.theme === 'light' ? '#333' : '#fff';
  }};
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p<ThemeProps>`
  margin: 0 0 8px 0;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  font-size: 0.9rem;
`;

const TimeInfo = styled.div<ThemeProps>`
  font-size: 0.8rem;
  color: ${props => props.theme === 'light' ? '#999' : '#666'};
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    margin-left: 0;
    margin-top: 12px;
    justify-content: flex-start;
  }
`;

const Button = styled.button<{ variant?: 'danger' | 'secondary'; theme: 'light' | 'dark' }>`
  background-color: ${props => {
    if (props.variant === 'danger') return '#ff4444';
    if (props.variant === 'secondary') return props.theme === 'light' ? '#e0e0e0' : '#4a4a4a';
    return props.theme === 'light' ? '#2196f3' : '#61dafb';
  }};
  color: ${props => {
    if (props.variant === 'danger') return 'white';
    if (props.variant === 'secondary') return props.theme === 'light' ? '#333' : 'white';
    return props.theme === 'light' ? 'white' : '#1a1a1a';
  }};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  justify-content: center;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    flex: 1;
  }
  
  &:hover {
    background-color: ${props => {
      if (props.variant === 'danger') return '#ff6666';
      if (props.variant === 'secondary') return props.theme === 'light' ? '#d0d0d0' : '#5a5a5a';
      return props.theme === 'light' ? '#1976d2' : '#4fa8d1';
    }};
  }
`;

const CollaboratorCount = styled.div<ThemeProps>`
  font-size: 0.8rem;
  color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: ${props => props.theme === 'light' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(97, 218, 251, 0.1)'};
  border-radius: 4px;
  margin-left: 8px;
`;

const CollaboratorIcon = styled.span<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  font-size: 1rem;
`;

const CollaboratorInfo = styled.div<ThemeProps>`
  margin-top: 8px;
  font-size: 0.8rem;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  background-color: ${props => props.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  word-break: break-word;
  max-width: 100%;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 6px;
    margin-top: 6px;
  }
`;

const CollaboratorEmails = styled.span`
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

const ShareIcon = styled.span`
  font-size: 1rem;
  margin-right: 4px;
`;

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete,
  onToggle,
  onAddCollaborator,
  onRemoveCollaborator,
  onAddComment,
  onEdit,
  theme,
  dragHandle
}) => {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { currentUser } = useAuth();
  const isOwner = currentUser?.uid === todo.ownerId;
  const isCollaborator = todo.collaborators.some(c => c.id === currentUser?.uid);
  
  console.log('TodoItem:', {
    todoId: todo.id,
    currentUserId: currentUser?.uid,
    todoOwnerId: todo.ownerId,
    isOwner,
    hasCollaborators: todo.collaborators.length > 0
  });

  const handleAddCollaborator = async (email: string) => {
    await onAddCollaborator(todo.id, email);
  };

  const handleRemoveCollaborator = async (userId: string) => {
    await onRemoveCollaborator(todo.id, userId);
  };

  const handleAddComment = async (text: string) => {
    await onAddComment(todo.id, text);
  };

  return (
    <ItemContainer theme={theme}>
      <MainContent>
        {!todo.completed && dragHandle}
        <Checkbox
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <Content completed={todo.completed} theme={theme}>
          <Title>
            {todo.title}
            {todo.collaborators.length > 0 && (
              <CollaboratorCount theme={theme}>
                <CollaboratorIcon theme={theme}>👥</CollaboratorIcon>
                {todo.collaborators.length}
              </CollaboratorCount>
            )}
          </Title>
          {todo.description && (
            <Description theme={theme}>{todo.description}</Description>
          )}
          {(todo.startTime || todo.endTime) && (
            <TimeInfo theme={theme}>
              {todo.startTime && `Start: ${todo.startTime}`}
              {todo.startTime && todo.endTime && ' - '}
              {todo.endTime && `End: ${todo.endTime}`}
            </TimeInfo>
          )}
          {todo.collaborators.length > 0 && (
            <CollaboratorInfo theme={theme}>
              <CollaboratorIcon theme={theme}>👥</CollaboratorIcon>
              <CollaboratorEmails>
                Shared with: {todo.collaborators.map(c => c.email).join(', ')}
              </CollaboratorEmails>
            </CollaboratorInfo>
          )}
        </Content>
      </MainContent>

      <ButtonGroup>
        {(isOwner || isCollaborator) && (
          <>
            {todo.collaborators.length > 0 && (
              <Button
                onClick={() => setShowComments(!showComments)}
                variant="secondary"
                theme={theme}
              >
                💬 {todo.comments?.length || 0}
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="secondary"
                  theme={theme}
                >
                  ✏️ Edit
                </Button>
                <Button
                  onClick={() => setShowCollaborators(true)}
                  variant="secondary"
                  theme={theme}
                >
                  <ShareIcon>👥</ShareIcon>
                  Share
                </Button>
              </>
            )}
          </>
        )}
        <Button
          onClick={() => onDelete(todo.id)}
          variant="danger"
          theme={theme}
        >
          Delete
        </Button>
      </ButtonGroup>

      {showCollaborators && (
        <CollaboratorModal
          onClose={() => setShowCollaborators(false)}
          onAdd={handleAddCollaborator}
          onRemove={handleRemoveCollaborator}
          collaborators={todo.collaborators}
          theme={theme}
        />
      )}

      {showComments && (
        <CommentSection
          todoId={todo.id}
          comments={todo.comments || []}
          onAddComment={onAddComment}
          theme={theme}
        />
      )}

      {showEditModal && (
        <EditTodoModal
          todo={todo}
          onClose={() => setShowEditModal(false)}
          onSave={onEdit}
          theme={theme}
        />
      )}
    </ItemContainer>
  );
};

export default TodoItem; 