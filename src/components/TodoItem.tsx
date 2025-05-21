import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Todo } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CollaboratorModal from './CollaboratorModal';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddCollaborator: (todoId: string, email: string) => Promise<void>;
  onRemoveCollaborator: (todoId: string, userId: string) => Promise<void>;
}

const ItemContainer = styled(motion.div)`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  position: relative;
  
  &:hover {
    background-color: #333;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 4px;
  cursor: pointer;
`;

const Content = styled.div<{ completed: boolean }>`
  flex: 1;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? '#666' : '#fff'};
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p`
  margin: 0 0 8px 0;
  color: #999;
  font-size: 0.9rem;
`;

const TimeInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-left: auto;
`;

const Button = styled.button<{ variant?: 'danger' | 'secondary' }>`
  background-color: ${props => {
    switch (props.variant) {
      case 'danger':
        return '#ff4444';
      case 'secondary':
        return '#4a4a4a';
      default:
        return '#61dafb';
    }
  }};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'danger':
          return '#ff6666';
        case 'secondary':
          return '#5a5a5a';
        default:
          return '#4fa8d1';
      }
    }};
  }
`;

const CollaboratorCount = styled.div`
  font-size: 0.8rem;
  color: #61dafb;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: rgba(97, 218, 251, 0.1);
  border-radius: 4px;
  margin-left: 8px;
`;

const CollaboratorIcon = styled.span`
  color: #61dafb;
  font-size: 1rem;
`;

const CollaboratorInfo = styled.div`
  margin-top: 8px;
  font-size: 0.8rem;
  color: #999;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShareIcon = styled.span`
  font-size: 1rem;
  margin-right: 4px;
`;

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdate,
  onDelete,
  onToggle,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const { currentUser } = useAuth();
  const isOwner = currentUser?.uid === todo.ownerId;
  
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

  return (
    <>
      <ItemContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Checkbox
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <Content completed={todo.completed}>
          <Title>
            {todo.title}
            {todo.collaborators.length > 0 && (
              <CollaboratorCount>
                <CollaboratorIcon>👥</CollaboratorIcon>
                {todo.collaborators.length}
              </CollaboratorCount>
            )}
          </Title>
          <Description>{todo.description}</Description>
          {todo.startTime && todo.endTime && (
            <TimeInfo>
              {todo.startTime} - {todo.endTime}
            </TimeInfo>
          )}
          {todo.collaborators.length > 0 && (
            <CollaboratorInfo>
              <CollaboratorIcon>👥</CollaboratorIcon>
              Shared with: {todo.collaborators.map(c => c.email).join(', ')}
            </CollaboratorInfo>
          )}
        </Content>
        <ButtonGroup>
          {isOwner && (
            <Button
              variant="secondary"
              onClick={() => setShowCollaborators(true)}
            >
              <ShareIcon>🔗</ShareIcon>
              Share
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => onDelete(todo.id)}
          >
            Delete
          </Button>
        </ButtonGroup>
      </ItemContainer>
      
      {showCollaborators && (
        <CollaboratorModal
          todo={todo}
          onClose={() => setShowCollaborators(false)}
          onAddCollaborator={handleAddCollaborator}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      )}
    </>
  );
};

export default TodoItem; 