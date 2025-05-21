import React from 'react';
import styled from '@emotion/styled';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { Todo, TodoFormData } from './types';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
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

    console.log('Current user ID:', currentUser.uid);
    
    const q = query(
      collection(db, 'todos'),
      where('sharedWith', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosData: Todo[] = [];
      querySnapshot.forEach((doc) => {
        const todoData = { ...doc.data() as Todo, id: doc.id };
        // Ensure order exists
        if (typeof todoData.order !== 'number') {
          todoData.order = 0;
        }
        todosData.push(todoData);
      });

      // Sort todos: incomplete first (sorted by order), then completed (sorted by last modified)
      setTodos(todosData.sort((a, b) => {
        if (a.completed === b.completed) {
          if (!a.completed) {
            return a.order - b.order;
          }
          return (b.lastModifiedAt || 0) - (a.lastModifiedAt || 0);
        }
        return a.completed ? 1 : -1;
      }));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTodo = async (todoData: TodoFormData) => {
    try {
      if (!currentUser) return;
      
      // Get the highest order number from incomplete todos
      const highestOrder = todos
        .filter(t => !t.completed)
        .reduce((max, todo) => Math.max(max, todo.order || 0), -1);
      
      const newTodo = {
        ...todoData,
        completed: false,
        ownerId: currentUser.uid,
        sharedWith: [currentUser.uid],
        collaborators: [],
        lastModifiedBy: currentUser.uid,
        lastModifiedAt: Date.now(),
        order: highestOrder + 1
      };

      console.log('Creating new todo:', newTodo);
      const docRef = await addDoc(collection(db, 'todos'), newTodo);
      console.log('Todo created with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id: string, updatedTodo: Todo) => {
    try {
      if (!currentUser) return;
      
      const todoRef = doc(db, 'todos', id);
      const { id: _, ...todoData } = updatedTodo;
      await updateDoc(todoRef, {
        ...todoData,
        lastModifiedBy: currentUser.uid,
        lastModifiedAt: Date.now()
      });
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
      const incompleteTodos = todos.filter(t => !t.completed && t.id !== id);
      
      await updateTodo(id, { 
        ...todo, 
        completed: !todo.completed,
        // If marking as incomplete, put at the end of incomplete list
        order: !todo.completed ? -1 : incompleteTodos.length,
        lastModifiedAt: Date.now() 
      });

      // If marking as incomplete, update orders of other incomplete todos
      if (todo.completed) {
        const updates = incompleteTodos.map((t, index) => {
          const todoRef = doc(db, 'todos', t.id);
          return updateDoc(todoRef, { order: index });
        });
        await Promise.all(updates);
      }
    }
  };

  const reorderTodos = async (startIndex: number, endIndex: number) => {
    try {
      const incompleteTodos = todos.filter(t => !t.completed);
      const updatedTodos = [...incompleteTodos];
      const [movedTodo] = updatedTodos.splice(startIndex, 1);
      updatedTodos.splice(endIndex, 0, movedTodo);

      // Update local state immediately for smooth UI
      const newTodos = [...todos];
      const incompleteIds = new Set(incompleteTodos.map(t => t.id));
      newTodos.sort((a, b) => {
        if (a.completed === b.completed) {
          if (!a.completed) {
            const aIndex = updatedTodos.findIndex(t => t.id === a.id);
            const bIndex = updatedTodos.findIndex(t => t.id === b.id);
            return aIndex - bIndex;
          }
          return (b.lastModifiedAt || 0) - (a.lastModifiedAt || 0);
        }
        return a.completed ? 1 : -1;
      });
      setTodos(newTodos);

      // Calculate and update orders in the database
      const updates = updatedTodos.map((todo, index) => {
        const newOrder = index * 1000; // Use larger intervals to allow for future insertions
        return updateDoc(doc(db, 'todos', todo.id), {
          order: newOrder,
          lastModifiedAt: Date.now(),
          lastModifiedBy: currentUser?.uid
        });
      });

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering todos:', error);
    }
  };

  const addCollaborator = async (todoId: string, email: string) => {
    try {
      if (!currentUser) return;

      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const collaborator = querySnapshot.docs[0];
      const todoRef = doc(db, 'todos', todoId);
      const todo = todos.find(t => t.id === todoId);

      if (!todo) return;

      // Check if user is already a collaborator
      if (todo.collaborators.some(c => c.id === collaborator.id)) {
        throw new Error('User is already a collaborator');
      }

      // Check if trying to add the owner
      if (todo.ownerId === collaborator.id) {
        throw new Error('Cannot add owner as collaborator');
      }

      await updateDoc(todoRef, {
        collaborators: [...todo.collaborators, { id: collaborator.id, email }],
        sharedWith: [...todo.sharedWith, collaborator.id],
        lastModifiedBy: currentUser.uid,
        lastModifiedAt: Date.now()
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  };

  const removeCollaborator = async (todoId: string, userId: string) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      const todo = todos.find(t => t.id === todoId);

      if (!todo) return;

      await updateDoc(todoRef, {
        collaborators: todo.collaborators.filter(c => c.id !== userId),
        sharedWith: todo.sharedWith.filter(id => id !== userId),
        lastModifiedBy: currentUser?.uid,
        lastModifiedAt: Date.now()
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
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
        onDelete={deleteTodo}
        onToggle={toggleTodo}
        onReorder={reorderTodos}
        onAddCollaborator={addCollaborator}
        onRemoveCollaborator={removeCollaborator}
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