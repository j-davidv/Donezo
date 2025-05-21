import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { TodoFormData } from '../types';

interface ThemeProps {
  theme?: 'light' | 'dark';
}

interface AddTodoFormProps {
  onAdd: (todo: TodoFormData) => void;
  theme?: 'light' | 'dark';
}

const FormContainer = styled.form<ThemeProps>`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
  background-color: ${props => props.theme === 'light' ? '#fff' : '#2a2a2a'};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 15px;
    margin-bottom: 1rem;
  }
`;

const Input = styled.input<ThemeProps>`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const TextArea = styled.textarea<ThemeProps>`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
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

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 0.9rem;
    min-height: 80px;
  }
`;

const TimeContainer = styled.div`
  display: flex;
  gap: 16px;
  margin: 8px 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const TimeLabel = styled.div<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  font-size: 0.9rem;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const AddButton = styled(motion.button)<ThemeProps>`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  color: ${props => props.theme === 'light' ? '#fff' : '#1a1a1a'};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme === 'light' ? '#1976d2' : '#4fa8d1'};
  }

  &:disabled {
    background-color: ${props => props.theme === 'light' ? '#e0e0e0' : '#444'};
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 0.9rem;
    margin-top: 12px;
  }
`;

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd, theme = 'dark' }) => {
  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onAdd(formData);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      // Validate times only if at least one is filled
      ((!formData.startTime && !formData.endTime) || 
       (formData.startTime && formData.endTime))
    );
  };

  return (
    <FormContainer onSubmit={handleSubmit} theme={theme}>
      <Input
        type="text"
        placeholder="Task title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        theme={theme}
      />
      <TextArea
        placeholder="Task description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        theme={theme}
      />
      <TimeLabel theme={theme}>Optional time allocation:</TimeLabel>
      <TimeContainer>
        <Input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          placeholder="Start time (optional)"
          theme={theme}
        />
        <Input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          placeholder="End time (optional)"
          theme={theme}
        />
      </TimeContainer>
      <AddButton
        type="submit"
        disabled={!isFormValid()}
        whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
        whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
        theme={theme}
      >
        Add Task
      </AddButton>
    </FormContainer>
  );
};

export default AddTodoForm; 