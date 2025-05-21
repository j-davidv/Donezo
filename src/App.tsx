import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import { Todo } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #61dafb;
  text-align: center;
`;

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (todo: Todo) => {
    setTodos([...todos, todo]);
  };

  const updateTodo = (id: string, updatedTodo: Todo) => {
    setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const reorderTodos = (startIndex: number, endIndex: number) => {
    const newTodos = Array.from(todos);
    const [removed] = newTodos.splice(startIndex, 1);
    newTodos.splice(endIndex, 0, removed);
    setTodos(newTodos);
  };

  return (
    <AppContainer>
      <Title>Donezo</Title>
      <AddTodoForm onAdd={addTodo} />
      <TodoList
        todos={todos}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        onToggle={toggleTodo}
        onReorder={reorderTodos}
      />
    </AppContainer>
  );
};

export default App; 