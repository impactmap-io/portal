import { create } from 'zustand';
import { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  addComment: (comment: Comment) => void;
  removeComment: (id: string) => void;
  addReaction: (commentId: string, reaction: string, userId: string) => void;
  removeReaction: (commentId: string, reaction: string, userId: string) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  addComment: (comment) => 
    set((state) => ({
      comments: [...state.comments, comment],
    })),
  removeComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== id),
    })),
  addReaction: (commentId, reaction, userId) =>
    set((state) => ({
      comments: state.comments.map((comment) => {
        if (comment.id !== commentId) return comment;
        
        const existingReaction = comment.reactions?.find((r) => r.type === reaction);
        if (!existingReaction) {
          return {
            ...comment,
            reactions: [
              ...(comment.reactions || []),
              { type: reaction as any, count: 1, users: [userId] },
            ],
          };
        }
        
        if (existingReaction.users.includes(userId)) return comment;
        
        return {
          ...comment,
          reactions: comment.reactions?.map((r) =>
            r.type === reaction
              ? { ...r, count: r.count + 1, users: [...r.users, userId] }
              : r
          ),
        };
      }),
    })),
  removeReaction: (commentId, reaction, userId) =>
    set((state) => ({
      comments: state.comments.map((comment) => {
        if (comment.id !== commentId) return comment;
        
        return {
          ...comment,
          reactions: comment.reactions
            ?.map((r) => {
              if (r.type !== reaction) return r;
              const users = r.users.filter((u) => u !== userId);
              return { ...r, count: users.length, users };
            })
            .filter((r) => r.count > 0),
        };
      }),
    })),
}));