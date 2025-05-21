import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Todo } from '../types';

interface CollaboratorModalProps {
  todo: Todo;
  onClose: () => void;
  onAddCollaborator: (email: string) => Promise<void>;
  onRemoveCollaborator: (userId: string) => Promise<void>;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const Title = styled.h2`
  color: #61dafb;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #61dafb;
  }
`;

const Button = styled.button<{ variant?: 'danger' }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.variant === 'danger' ? '#ff4444' : '#61dafb'};
  color: ${props => props.variant === 'danger' ? 'white' : '#1a1a1a'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;

  &:hover {
    background-color: ${props => props.variant === 'danger' ? '#ff6666' : '#4fa8d1'};
  }
`;

const CollaboratorList = styled.div`
  margin-top: 1.5rem;
`;

const CollaboratorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #333;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 0.5rem;
  text-align: center;
`;

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  todo,
  onClose,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');
      await onAddCollaborator(email);
      setEmail('');
    } catch (err) {
      setError('Failed to add collaborator. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Manage Collaborators</Title>
        <form onSubmit={handleAddCollaborator}>
          <Input
            type="email"
            placeholder="Enter collaborator's email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Collaborator'}
          </Button>
        </form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <CollaboratorList>
          {todo.collaborators.map(collaborator => (
            <CollaboratorItem key={collaborator.id}>
              <span>{collaborator.email}</span>
              <Button
                variant="danger"
                onClick={() => onRemoveCollaborator(collaborator.id)}
              >
                Remove
              </Button>
            </CollaboratorItem>
          ))}
        </CollaboratorList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CollaboratorModal; 