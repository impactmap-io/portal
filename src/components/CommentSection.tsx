import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { MessageSquare, ThumbsUp, ThumbsDown, Heart, Target, Lightbulb, X } from 'lucide-react';
import { useCommentStore } from '../store/commentStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Comment } from '../types';

interface CommentSectionProps {
  entityId: string;
  entityType: Comment['entityType'];
  entityTitle: string;
}

const REACTIONS = [
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '👎', icon: ThumbsDown },
  { emoji: '❤️', icon: Heart },
  { emoji: '🎯', icon: Target },
  { emoji: '💡', icon: Lightbulb },
];

export default function CommentSection({ entityId, entityType, entityTitle }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { comments, addComment, addReaction, removeReaction } = useCommentStore();
  const { addNotification } = useNotificationStore();
  
  const entityComments = comments.filter(
    (comment) => comment.entityId === entityId && comment.entityType === entityType
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      content: newComment.trim(),
      author: 'Current User', // In a real app, get from auth context
      entityId,
      entityType,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    addComment(comment);
    addNotification({
      title: 'New Comment',
      message: `A new comment was added to ${entityTitle}`,
      type: 'info',
      entityId,
      entityType,
    });

    setNewComment('');
  };

  const handleReaction = (commentId: string, reaction: string) => {
    const userId = 'current-user'; // In a real app, get from auth context
    const comment = comments.find((c) => c.id === commentId);
    const hasReacted = comment?.reactions?.some(
      (r) => r.type === reaction && r.users.includes(userId)
    );

    if (hasReacted) {
      removeReaction(commentId, reaction, userId);
    } else {
      addReaction(commentId, reaction, userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h3 className="ml-2 text-lg font-medium text-gray-900">Comments</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextareaAutosize
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          minRows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {entityComments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeComment(comment.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{comment.content}</p>
            <div className="mt-4 flex items-center space-x-2">
              {REACTIONS.map(({ emoji, icon: Icon }) => {
                const reaction = comment.reactions?.find((r) => r.type === emoji);
                const hasReacted = reaction?.users.includes('current-user');
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors
                      ${
                        hasReacted
                          ? 'bg-indigo-50 text-black'
                          : 'hover:bg-gray-50 text-gray-500'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{reaction?.count || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
