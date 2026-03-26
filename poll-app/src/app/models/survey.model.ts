export interface Option {
  id: number;
  label: string;
  text: string;
  votes: number;
}

export interface Question {
  id: number;
  text: string;
  allowMultiple: boolean;
  options: Option[];
}

export type SurveyStatus = 'active' | 'closed' | 'draft';

export interface Survey {
  id: number;
  title: string;
  description?: string;
  deadline?: Date;
  category?: string;
  status: SurveyStatus;
  questions: Question[];
  createdAt: Date;
  readonly totalVotes?: number;
}

export type CreateSurveyData = Omit<Survey, 'id' | 'createdAt' | 'status'>;
