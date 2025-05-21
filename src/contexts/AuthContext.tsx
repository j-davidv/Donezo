import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styled from '@emotion/styled';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
  color: #61dafb;
  font-size: 1.5rem;
`;

interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
}

interface AuthContextType {
  currentUser: User | null;
  userSettings: UserSettings | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  updateUserTheme: (theme: 'light' | 'dark') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserSettings = async (user: User) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserSettings({
        name: data.name || user.email?.split('@')[0] || 'User',
        theme: data.theme || 'dark'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserSettings(user);
      } else {
        setUserSettings(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name,
      theme: 'dark',
      createdAt: Date.now(),
      todos: []
    });

    setUserSettings({
      name,
      theme: 'dark'
    });
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserSettings(userCredential.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserSettings(null);
  };

  const updateUserName = async (name: string) => {
    if (!currentUser) return;
    
    await updateProfile(currentUser, { displayName: name });
    await updateDoc(doc(db, 'users', currentUser.uid), { name });
    
    setUserSettings(prev => prev ? { ...prev, name } : { name, theme: 'dark' });
  };

  const updateUserTheme = async (theme: 'light' | 'dark') => {
    if (!currentUser) return;
    
    await updateDoc(doc(db, 'users', currentUser.uid), { theme });
    setUserSettings(prev => prev ? { ...prev, theme } : { name: 'User', theme });
  };

  const value = {
    currentUser,
    userSettings,
    signup,
    login,
    logout,
    updateUserName,
    updateUserTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <LoadingContainer>Loading...</LoadingContainer>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}; 