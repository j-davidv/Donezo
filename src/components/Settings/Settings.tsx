import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const SettingsContainer = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  color: #61dafb;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
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

const Button = styled(motion.button)`
  padding: 0.75rem;
  background-color: #61dafb;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;

  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const ThemeButton = styled(motion.button)`
  padding: 0.4rem 0.8rem;
  background-color: #61dafb;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 100px;
  height: 32px;

  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const ThemeToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #333;
  border-radius: 4px;
  margin-top: 1rem;
  gap: 1rem;
`;

const ThemeLabel = styled.span`
  color: white;
  font-size: 0.9rem;
`;

const SuccessMessage = styled(motion.div)`
  color: #4caf50;
  text-align: center;
  margin-top: 1rem;
`;

const CloseButton = styled(Button)`
  margin-top: 2rem;
  background-color: #444;
  
  &:hover {
    background-color: #555;
  }
`;

const Settings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userSettings, updateUserName, updateUserTheme } = useAuth();
  const [name, setName] = useState(userSettings?.name || '');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    try {
      setLoading(true);
      await updateUserName(name.trim());
      setSuccess('Name updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = async () => {
    if (!userSettings || loading) return;
    
    try {
      setLoading(true);
      const newTheme = userSettings.theme === 'dark' ? 'light' : 'dark';
      await updateUserTheme(newTheme);
      setSuccess('Theme updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating theme:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <Title>Settings</Title>
      <Form onSubmit={handleNameUpdate}>
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Updating...' : 'Update Name'}
        </Button>
      </Form>

      <ThemeToggle>
        <ThemeLabel>Theme: {userSettings?.theme === 'dark' ? 'Dark' : 'Light'}</ThemeLabel>
        <ThemeButton
          onClick={handleThemeToggle}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Toggle Theme
        </ThemeButton>
      </ThemeToggle>

      <CloseButton
        onClick={onClose}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Close
      </CloseButton>

      {success && (
        <SuccessMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {success}
        </SuccessMessage>
      )}
    </SettingsContainer>
  );
};

export default Settings;