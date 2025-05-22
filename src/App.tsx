import React from 'react';
import styled from '@emotion/styled';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Settings from './components/Settings/Settings';
import { Todo, TodoFormData } from './types';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

interface ThemeProps {
  theme: 'light' | 'dark';
}

const AppContainer = styled.div<ThemeProps>`
  min-height: 100vh;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#1a1a1a'};
  color: ${props => props.theme === 'light' ? '#333' : '#ffffff'};
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1<ThemeProps>`
  font-size: 2.5rem;
  color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  text-align: center;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const Button = styled.button<ThemeProps>`
  padding: 8px 16px;
  background-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  color: ${props => props.theme === 'light' ? '#fff' : '#1a1a1a'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 100px;

  &:hover {
    background-color: ${props => props.theme === 'light' ? '#1976d2' : '#4fa8d1'};
  }

  @media (max-width: 480px) {
    flex: 1;
    max-width: 150px;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #ff4444;
  &:hover {
    background-color: #ff6666;
  }
`;

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

const LoadingContainer = styled.div<ThemeProps>`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#1a1a1a'};
  color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
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
  const { currentUser, logout, userSettings } = useAuth();
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [showSettings, setShowSettings] = React.useState(false);

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

  const addComment = async (todoId: string, text: string) => {
    try {
      if (!currentUser) return;

      const todoRef = doc(db, 'todos', todoId);
      const todo = todos.find(t => t.id === todoId);

      if (!todo) return;

      // Get the user's name from their settings
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const userName = userData?.name || currentUser.email?.split('@')[0] || 'Unknown';

      const newComment = {
        id: crypto.randomUUID(),
        text,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'Unknown',
        userName: userName,
        createdAt: Date.now()
      };

      await updateDoc(todoRef, {
        comments: [...(todo.comments || []), newComment],
        lastModifiedBy: currentUser.uid,
        lastModifiedAt: Date.now()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const editTodo = async (todoId: string, title: string, description: string, startTime: string, endTime: string) => {
    try {
      if (!currentUser) return;

      const todoRef = doc(db, 'todos', todoId);
      const todo = todos.find(t => t.id === todoId);

      if (!todo) return;

      await updateDoc(todoRef, {
        title,
        description,
        startTime,
        endTime,
        lastModifiedBy: currentUser.uid,
        lastModifiedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating todo:', error);
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
    <AppContainer theme={userSettings?.theme || 'dark'}>
      <Header>
        <Title theme={userSettings?.theme || 'dark'}>Donezo</Title>
        <HeaderButtons>
          <Button
            theme={userSettings?.theme || 'dark'}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <LogoutButton theme={userSettings?.theme || 'dark'} onClick={handleLogout}>
            Logout
          </LogoutButton>
        </HeaderButtons>
      </Header>
      <AddTodoForm onAdd={addTodo} theme={userSettings?.theme || 'dark'} />
      <TodoList
        todos={todos}
        onDelete={deleteTodo}
        onToggle={toggleTodo}
        onReorder={reorderTodos}
        onAddCollaborator={addCollaborator}
        onRemoveCollaborator={removeCollaborator}
        onAddComment={addComment}
        onEdit={editTodo}
        theme={userSettings?.theme || 'dark'}
      />
      {showSettings && (
        <ModalOverlay onClick={() => setShowSettings(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        </ModalOverlay>
      )}
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
      <LoadingContainer theme="dark">
        Initializing...
      </LoadingContainer>
    );
  }

  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
};

export default App; 