export interface User {
  id: string;
  email: string;
  totalQuestions: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  upvotes: number;
  downvotes: number;
}

export interface Quiz {
  id: string;
  questions: Question[];
  createdBy: string;
  topic?: string;
  shareCode?: string;
}
