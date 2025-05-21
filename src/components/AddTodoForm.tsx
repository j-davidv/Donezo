import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { TodoFormData } from '../types';

interface AddTodoFormProps {
  onAdd: (todo: TodoFormData) => void;
}

const FormContainer = styled.form`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #61dafb;
  }
`;

const TimeContainer = styled.div`
  display: flex;
  gap: 16px;
  margin: 8px 0;
`;

const TimeLabel = styled.div`
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const AddButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: #61dafb;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd }) => {
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
    <FormContainer onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Task title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <TextArea
        placeholder="Task description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <TimeLabel>Optional time allocation:</TimeLabel>
      <TimeContainer>
        <Input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          placeholder="Start time (optional)"
        />
        <Input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          placeholder="End time (optional)"
        />
      </TimeContainer>
      <AddButton
        type="submit"
        disabled={!isFormValid()}
        whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
        whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
      >
        Add Task
      </AddButton>
    </FormContainer>
  );
};

export default AddTodoForm; 