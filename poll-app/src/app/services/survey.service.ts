import { Injectable, signal, computed } from '@angular/core';

import { Survey, CreateSurveyData } from '../models/survey.model';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SEVEN_DAYS_MS = 7 * MS_PER_DAY;

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private surveysSignal = signal<Survey[]>(MOCK_SURVEYS);

  readonly activeSurveys = computed(() =>
    this.surveysSignal().filter((survey) => survey.status === 'active')
  );

  readonly pastSurveys = computed(() =>
    this.surveysSignal().filter((survey) => survey.status === 'closed')
  );

  readonly endingSoon = computed(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + SEVEN_DAYS_MS);
    return this.surveysSignal()
      .filter((survey) =>
        survey.status === 'active' &&
        survey.deadline !== undefined &&
        survey.deadline <= cutoff
      )
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());
  });

  /** Returns a survey by its ID, or undefined if not found. */
  getSurveyById(id: number): Survey | undefined {
    return this.surveysSignal().find((survey) => survey.id === id);
  }

  /** Creates a new survey and adds it to the list. */
  createSurvey(data: CreateSurveyData): void {
    const newSurvey: Survey = {
      ...data,
      id: this.generateId(),
      status: 'active',
      createdAt: new Date(),
    };
    this.surveysSignal.update((surveys) => [...surveys, newSurvey]);
  }

  /** Records a vote for a specific option in a survey question. */
  vote(surveyId: number, questionId: number, optionId: number): void {
    this.surveysSignal.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id !== surveyId) return survey;
        return {
          ...survey,
          questions: survey.questions.map((question) => {
            if (question.id !== questionId) return question;
            return {
              ...question,
              options: question.options.map((option) => {
                if (option.id !== optionId) return option;
                return { ...option, votes: option.votes + 1 };
              }),
            };
          }),
        };
      })
    );
  }

  private generateId(): number {
    const ids = this.surveysSignal().map((survey) => survey.id);
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  }
}

const MOCK_SURVEYS: Survey[] = [
  {
    id: 1,
    title: "Let's Plan the Next Team Event Together",
    description:
      'We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.',
    category: 'Team activities',
    status: 'active',
    deadline: new Date(Date.now() + 2 * MS_PER_DAY),
    createdAt: new Date('2025-01-01'),
    questions: [
      {
        id: 1,
        text: 'Which date would work best for you?',
        allowMultiple: false,
        options: [
          { id: 1, label: 'A', text: '10.10.2025, Friday', votes: 12 },
          { id: 2, label: 'B', text: '11.10.2025, Saturday', votes: 8 },
          { id: 3, label: 'C', text: '21.10.2025, Saturday', votes: 5 },
          { id: 4, label: 'D', text: '31.10.2025, Friday', votes: 3 },
        ],
      },
      {
        id: 2,
        text: 'Choose the activities you prefer',
        allowMultiple: true,
        options: [
          { id: 5, label: 'A', text: 'Outdoor adventure like kayaking', votes: 15 },
          { id: 6, label: 'B', text: 'Office Costume Party', votes: 9 },
          { id: 7, label: 'C', text: 'Bowling, mini golf, volleyball', votes: 11 },
          { id: 8, label: 'D', text: 'Beach party, Music & cocktails', votes: 7 },
          { id: 9, label: 'E', text: 'Escape Room', votes: 4 },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Fit & wellness survey!',
    description: 'Help us understand your fitness and wellness goals.',
    category: 'Health & Wellness',
    status: 'active',
    deadline: new Date(Date.now() + 5 * MS_PER_DAY),
    createdAt: new Date('2025-01-05'),
    questions: [
      {
        id: 3,
        text: "What's most important to you in a team event?",
        allowMultiple: false,
        options: [
          { id: 10, label: 'A', text: 'Team bonding', votes: 20 },
          { id: 11, label: 'B', text: 'Food and drinks', votes: 14 },
          { id: 12, label: 'C', text: 'Trying something new', votes: 9 },
          { id: 13, label: 'D', text: 'Keeping it low-key and stress-free', votes: 6 },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Gaming habits and favorite games!',
    description: 'Tell us about your gaming preferences.',
    category: 'Gaming & Entertainment',
    status: 'active',
    deadline: new Date(Date.now() + 6 * MS_PER_DAY),
    createdAt: new Date('2025-01-10'),
    questions: [
      {
        id: 4,
        text: 'How long would you prefer the event to last?',
        allowMultiple: false,
        options: [
          { id: 14, label: 'A', text: 'Half a day', votes: 18 },
          { id: 15, label: 'B', text: 'Full day', votes: 12 },
          { id: 16, label: 'C', text: 'Evening only', votes: 8 },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Healthier future: Fit & wellness survey!',
    description: 'Share your thoughts on workplace wellness.',
    category: 'Healthy Lifestyle',
    status: 'active',
    deadline: new Date(Date.now() + 30 * MS_PER_DAY),
    createdAt: new Date('2025-01-15'),
    questions: [
      {
        id: 5,
        text: 'What wellness activities interest you?',
        allowMultiple: true,
        options: [
          { id: 17, label: 'A', text: 'Yoga sessions', votes: 10 },
          { id: 18, label: 'B', text: 'Running club', votes: 7 },
          { id: 19, label: 'C', text: 'Meditation', votes: 5 },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Office coffee preferences',
    description: 'Help us stock the right coffee for the office.',
    category: 'Team activities',
    status: 'closed',
    deadline: new Date('2024-12-01'),
    createdAt: new Date('2024-11-01'),
    questions: [
      {
        id: 6,
        text: 'Which coffee do you prefer?',
        allowMultiple: false,
        options: [
          { id: 20, label: 'A', text: 'Espresso', votes: 22 },
          { id: 21, label: 'B', text: 'Filter coffee', votes: 15 },
          { id: 22, label: 'C', text: 'Cappuccino', votes: 18 },
        ],
      },
    ],
  },
];
