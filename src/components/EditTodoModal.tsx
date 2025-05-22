import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Todo } from '../types';

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
  onSave: (todoId: string, title: string, description: string, startTime: string, endTime: string) => Promise<void>;
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
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input<ThemeProps>`
  width: 100%;
  padding: 0.75rem;
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

const TextArea = styled.textarea<ThemeProps>`
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }
`;

const TimeContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TimeLabel = styled.div<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary'; theme: 'light' | 'dark' }>`
  flex: 1;
  padding: 0.75rem;
  background-color: ${props => {
    if (props.variant === 'secondary') return props.theme === 'light' ? '#e0e0e0' : '#4a4a4a';
    return props.theme === 'light' ? '#2196f3' : '#61dafb';
  }};
  color: ${props => {
    if (props.variant === 'secondary') return props.theme === 'light' ? '#333' : 'white';
    return props.theme === 'light' ? 'white' : '#1a1a1a';
  }};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;

  &:hover {
    background-color: ${props => {
      if (props.variant === 'secondary') return props.theme === 'light' ? '#d0d0d0' : '#5a5a5a';
      return props.theme === 'light' ? '#1976d2' : '#4fa8d1';
    }};
  }
`;

const EditTodoModal: React.FC<EditTodoModalProps> = ({
  todo,
  onClose,
  onSave,
  theme
}) => {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [startTime, setStartTime] = useState(todo.startTime || '');
  const [endTime, setEndTime] = useState(todo.endTime || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(todo.id, title.trim(), description.trim(), startTime, endTime);
      onClose();
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} theme={theme}>
        <Title theme={theme}>Edit Task</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            theme={theme}
          />
          <TextArea
            placeholder="Task description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            theme={theme}
          />
          <TimeLabel theme={theme}>Time allocation (optional):</TimeLabel>
          <TimeContainer>
            <Input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              theme={theme}
            />
            <Input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              theme={theme}
            />
          </TimeContainer>
          <ButtonGroup>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              theme={theme}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              theme={theme}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditTodoModal; 