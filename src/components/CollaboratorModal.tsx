import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Todo } from '../types';

interface CollaboratorModalProps {
  todo: Todo;
  onClose: () => void;
  onAddCollaborator: (email: string) => Promise<void>;
  onRemoveCollaborator: (userId: string) => Promise<void>;
  theme: 'light' | 'dark';
}

interface ThemeProps {
  theme: 'light' | 'dark';
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

const ModalContent = styled.div<ThemeProps>`
  background-color: ${props => props.theme === 'light' ? '#fff' : '#2a2a2a'};
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Input = styled.input<ThemeProps>`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }
`;

const Button = styled.button<{ variant?: 'danger'; theme: 'light' | 'dark' }>`
  padding: 0.5rem 1rem;
  background-color: ${props => {
    if (props.variant === 'danger') return '#ff4444';
    return props.theme === 'light' ? '#2196f3' : '#61dafb';
  }};
  color: ${props => {
    if (props.variant === 'danger') return 'white';
    return props.theme === 'light' ? 'white' : '#1a1a1a';
  }};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;

  &:hover {
    background-color: ${props => {
      if (props.variant === 'danger') return '#ff6666';
      return props.theme === 'light' ? '#1976d2' : '#4fa8d1';
    }};
  }

  &:disabled {
    background-color: ${props => props.theme === 'light' ? '#e0e0e0' : '#444'};
    color: ${props => props.theme === 'light' ? '#999' : '#666'};
    cursor: not-allowed;
  }
`;

const CollaboratorList = styled.div`
  margin-top: 1.5rem;
`;

const CollaboratorItem = styled.div<ThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'light' ? '#333' : '#fff'};
`;

const ErrorMessage = styled.div<ThemeProps>`
  color: #ff4444;
  margin-top: 0.5rem;
  text-align: center;
`;

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  todo,
  onClose,
  onAddCollaborator,
  onRemoveCollaborator,
  theme,
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
      <ModalContent onClick={e => e.stopPropagation()} theme={theme}>
        <Title theme={theme}>Manage Collaborators</Title>
        <form onSubmit={handleAddCollaborator}>
          <Input
            type="email"
            placeholder="Enter collaborator's email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            theme={theme}
          />
          <Button type="submit" disabled={loading} theme={theme}>
            {loading ? 'Adding...' : 'Add Collaborator'}
          </Button>
        </form>
        {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
        
        <CollaboratorList>
          {todo.collaborators.map(collaborator => (
            <CollaboratorItem key={collaborator.id} theme={theme}>
              <span>{collaborator.email}</span>
              <Button
                variant="danger"
                onClick={() => onRemoveCollaborator(collaborator.id)}
                theme={theme}
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