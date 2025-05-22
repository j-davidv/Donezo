import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from '@emotion/styled';
import { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface CommentSectionProps {
  todoId: string;
  comments: Comment[];
  onAddComment: (todoId: string, text: string) => Promise<void>;
  theme: 'light' | 'dark';
}

interface ThemeProps {
  theme: 'light' | 'dark';
}

const Container = styled.div<ThemeProps>`
  margin-top: 16px;
  padding: 16px;
  background-color: ${props => props.theme === 'light' ? '#f8f9fa' : '#1e1e1e'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'light' ? '#e9ecef' : '#2d2d2d'};
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  margin-left: 0;
  margin-right: 0;
`;

const CommentList = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const CommentItem = styled.div<ThemeProps>`
  background-color: ${props => props.theme === 'light' ? '#fff' : '#2a2a2a'};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'light' ? '#eee' : '#444'};
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  width: 100%;
  box-sizing: border-box;
`;

const CommentHeader = styled.div<ThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: ${props => props.theme === 'light' ? '#666' : '#999'};
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const CommentText = styled.div<ThemeProps>`
  color: ${props => props.theme === 'light' ? '#333' : '#fff'};
  font-size: 0.95rem;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const CommentInput = styled.textarea<ThemeProps>`
  flex: 1;
  background-color: ${props => props.theme === 'light' ? '#fff' : '#333'};
  border: 1px solid ${props => props.theme === 'light' ? '#ddd' : '#444'};
  border-radius: 4px;
  padding: 8px 12px;
  color: ${props => props.theme === 'light' ? '#333' : 'white'};
  font-size: 0.95rem;
  min-height: 60px;
  max-height: 200px;
  resize: vertical;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'light' ? '#2196f3' : '#61dafb'};
  }

  &::placeholder {
    color: ${props => props.theme === 'light' ? '#999' : '#666'};
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
  height: fit-content;
  align-self: flex-start;

  @media (max-width: 480px) {
    width: 100%;
  }

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
  padding: 24px;
  font-size: 0.9rem;
  background-color: ${props => props.theme === 'light' ? '#f5f5f5' : '#333'};
  border-radius: 8px;
`;

const CommentSection: React.FC<CommentSectionProps> = ({
  todoId,
  comments,
  onAddComment,
  theme,
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, userSettings } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(todoId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container theme={theme}>
      <CommentList>
        {comments.length === 0 ? (
          <NoComments theme={theme}>No comments yet</NoComments>
        ) : (
          comments
            .sort((a: Comment, b: Comment) => b.createdAt - a.createdAt)
            .map((comment: Comment) => (
              <CommentItem key={comment.id} theme={theme}>
                <CommentHeader theme={theme}>
                  <span>{comment.userName}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </CommentHeader>
                <CommentText theme={theme}>{comment.text}</CommentText>
              </CommentItem>
            ))
        )}
      </CommentList>
      <CommentForm onSubmit={handleSubmit}>
        <CommentInput
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
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