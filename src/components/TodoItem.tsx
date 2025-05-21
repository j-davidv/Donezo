import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
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
`;

const Description = styled.p`
  margin: 0 0 8px 0;
  color: #999;
  font-size: 0.9rem;
`;

const TimeInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const DeleteButton = styled.button`
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #ff6666;
  }
`;

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdate,
  onDelete,
  onToggle,
}) => {
  return (
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
        <Title>{todo.title}</Title>
        <Description>{todo.description}</Description>
        {todo.startTime && todo.endTime && (
          <TimeInfo>
            {todo.startTime} - {todo.endTime}
          </TimeInfo>
        )}
      </Content>
      <DeleteButton onClick={() => onDelete(todo.id)}>
        Delete
      </DeleteButton>
    </ItemContainer>
  );
};

export default TodoItem; 