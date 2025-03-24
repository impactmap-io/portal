import { create } from 'zustand';
import { Feedback } from '../types';

interface FeedbackState {
  feedback: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'submittedAt' | 'votes'>) => void;
  updateStatus: (id: string, status: Feedback['status']) => void;
  vote: (id: string, increment: boolean) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedback: [],
  addFeedback: (feedback) =>
    set((state) => ({
      feedback: [
        ...state.feedback,
        {
          ...feedback,
          id: crypto.randomUUID(),
          submittedAt: new Date().toISOString(),
          votes: 0,
        },
      ],
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      feedback: state.feedback.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    })),
  vote: (id, increment) =>
    set((state) => ({
      feedback: state.feedback.map((f) =>
        f.id === id ? { ...f, votes: f.votes + (increment ? 1 : -1) } : f
      ),
    })),
}));