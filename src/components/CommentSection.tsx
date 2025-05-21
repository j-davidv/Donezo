import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  theme: 'light' | 'dark';
}

interface ThemeProps {
  theme: 'light' | 'dark';
}

const Container = styled.div<ThemeProps>`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
`;

const CommentList = styled.div`
  margin-bottom: 16px;
`;

const CommentItem = styled.div<ThemeProps>`
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentHeader = styled.div<ThemeProps>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.8rem;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
`;

const CommentText = styled.div<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#333' : '#fff'};
  font-size: 0.9rem;
  word-break: break-word;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 8px;
`;

const CommentInput = styled.input<ThemeProps>`
  flex: 1;
  background-color: ${props => props.theme === 'light' ? '#fff' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  padding: 8px 12px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }
`;

const CommentButton = styled(motion.button)<ThemeProps>`
  background-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  color: ${props => props.theme === 'light' ? 'white' : '#1a1a1a'};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;

  &:disabled {
    background-color: ${props => props.theme === 'light' ? '#e0e0e0' : '#444'};
    color: ${props => props.theme === 'light' ? '#999' : '#666'};
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'light' ? '#1976d2' : '#4fa8d1'};
  }
`;

const NoComments = styled.div<ThemeProps>`
  text-align: center;
  color: ${props => props.theme === 'light' ? '#999' : '#666'};
  padding: 12px;
  font-size: 0.9rem;
`;

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  theme,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, userSettings } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Container theme={theme}>
      <CommentList>
        {comments.length === 0 ? (
          <NoComments theme={theme}>No comments yet</NoComments>
        ) : (
          comments
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((comment) => (
              <CommentItem key={comment.id} theme={theme}>
                <CommentHeader theme={theme}>
                  <span>{userSettings?.name || comment.userEmail}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </CommentHeader>
                <CommentText theme={theme}>{comment.text}</CommentText>
              </CommentItem>
            ))
        )}
      </CommentList>
      <CommentForm onSubmit={handleSubmit}>
        <CommentInput
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          theme={theme}
        />
        <CommentButton
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          theme={theme}
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </CommentButton>
      </CommentForm>
    </Container>
  );
};

export default CommentSection; 