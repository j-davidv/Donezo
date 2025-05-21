import React from 'react';
import styled from '@emotion/styled';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { Todo } from './types';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

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

const LogoutButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #ff6666;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
  color: #61dafb;
  font-size: 1.5rem;
`;

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const TodoApp: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [todos, setTodos] = React.useState<Todo[]>([]);

  React.useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosData: Todo[] = [];
      querySnapshot.forEach((doc) => {
        todosData.push({ ...doc.data() as Todo, id: doc.id });
      });
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTodo = async (todo: Todo) => {
    try {
      await addDoc(collection(db, 'todos'), {
        ...todo,
        userId: currentUser?.uid
      });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id: string, updatedTodo: Todo) => {
    try {
      const todoRef = doc(db, 'todos', id);
      const { id: _, ...todoData } = updatedTodo;
      await updateDoc(todoRef, todoData);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { ...todo, completed: !todo.completed });
    }
  };

  const reorderTodos = async (startIndex: number, endIndex: number) => {
    const newTodos = Array.from(todos);
    const [removed] = newTodos.splice(startIndex, 1);
    newTodos.splice(endIndex, 0, removed);
    setTodos(newTodos);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <AppContainer>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
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

const App: React.FC = () => {
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if Firebase is initialized
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <LoadingContainer>
        Initializing...
      </LoadingContainer>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <TodoApp />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App; 