import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #2a2a2a;
  border-radius: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #333;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #61dafb;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #61dafb;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #4fa8d1;
  }

  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: #999;
`;

const StyledLink = styled(Link)`
  color: #61dafb;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in');
    }
    setLoading(false);
  };

  return (
    <AuthContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Log In</h2>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </Form>
      <LinkText>
        Need an account? <StyledLink to="/signup">Sign Up</StyledLink>
      </LinkText>
    </AuthContainer>
  );
};

export default Login; 