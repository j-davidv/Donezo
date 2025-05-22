import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface CollaboratorModalProps {
  onClose: () => void;
  onAdd: (email: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  collaborators: Array<{ id: string; email: string }>;
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

const Form = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
`;

const Input = styled.input<ThemeProps>`
  flex: 1;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  padding: 8px 12px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }
`;

const Button = styled(motion.button)<{ variant?: 'danger' | 'secondary'; theme: 'light' | 'dark' }>`
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${props => {
      if (props.variant === 'danger') return '#ff6666';
      if (props.variant === 'secondary') return props.theme === 'light' ? '#d0d0d0' : '#5a5a5a';
      return props.theme === 'light' ? '#1976d2' : '#4fa8d1';
    }};
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
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

const SavedCollaboratorsSection = styled.div`
  margin: 1rem 0;
`;

const SavedCollaboratorsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SavedCollaboratorChip = styled.button<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme === 'light' ? '#e3f2fd' : '#1e3a5f'};
  color: ${props => props.theme === 'light' ? '#1976d2' : '#61dafb'};
  border: 1px solid ${props => props.theme === 'light' ? '#90caf9' : '#2196f3'};
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme === 'light' ? '#bbdefb' : '#254875'};
  }
`;

const SectionTitle = styled.h3<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Divider = styled.div<ThemeProps>`
  height: 1px;
  background-color: ${props => props.theme === 'light' ? '#ddd' : '#444'};
  margin: 1rem 0;
`;

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  onClose,
  onAdd,
  onRemove,
  collaborators,
  theme,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedCollaborators, setSavedCollaborators] = useState<Array<{ id: string; email: string }>>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load saved collaborators when the modal opens
    const loadSavedCollaborators = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        if (userData?.savedCollaborators) {
          setSavedCollaborators(userData.savedCollaborators);
        }
      } catch (error) {
        console.error('Error loading saved collaborators:', error);
      }
    };

    loadSavedCollaborators();
  }, [currentUser]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    try {
      setLoading(true);
      setError('');
      await onAdd(email);
      
      // Save the collaborator if not already saved
      if (!savedCollaborators.some(c => c.email === email)) {
        const userRef = doc(db, 'users', currentUser!.uid);
        await updateDoc(userRef, {
          savedCollaborators: arrayUnion({ email, id: crypto.randomUUID() })
        });
        setSavedCollaborators([...savedCollaborators, { email, id: crypto.randomUUID() }]);
      }
      
      setEmail('');
    } catch (err) {
      setError('Failed to add collaborator. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedCollaborator = (email: string) => {
    setEmail(email);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} theme={theme}>
        <Title theme={theme}>Manage Collaborators</Title>
        
        {savedCollaborators.length > 0 && (
          <SavedCollaboratorsSection>
            <SectionTitle theme={theme}>Recent Collaborators</SectionTitle>
            <SavedCollaboratorsList>
              {savedCollaborators.map(collaborator => (
                <SavedCollaboratorChip
                  key={collaborator.id}
                  onClick={() => handleSelectSavedCollaborator(collaborator.email)}
                  theme={theme}
                >
                  {collaborator.email}
                </SavedCollaboratorChip>
              ))}
            </SavedCollaboratorsList>
            <Divider theme={theme} />
          </SavedCollaboratorsSection>
        )}

        <Form onSubmit={handleAddCollaborator}>
          <Input
            type="email"
            placeholder="Enter collaborator's email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            theme={theme}
          />
          <Button type="submit" disabled={loading} theme={theme}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </Form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <CollaboratorList>
          {collaborators.map(collaborator => (
            <CollaboratorItem key={collaborator.id} theme={theme}>
              <span>{collaborator.email}</span>
              <Button
                variant="danger"
                onClick={() => onRemove(collaborator.id)}
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