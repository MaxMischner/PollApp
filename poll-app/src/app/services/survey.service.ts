import { Injectable, signal, computed, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { Survey, CreateSurveyData } from '../models/survey.model';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SEVEN_DAYS_MS = 7 * MS_PER_DAY;
const VOTER_ID_KEY = 'poll_app_voter_id';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private supabase = inject(SupabaseService).client;
  private surveysSignal = signal<Survey[]>([]);

  readonly activeSurveys = computed(() =>
    this.surveysSignal().filter((s) => s.status === 'active')
  );

  readonly pastSurveys = computed(() =>
    this.surveysSignal().filter((s) => s.status === 'closed')
  );

  readonly endingSoon = computed(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + SEVEN_DAYS_MS);
    return this.surveysSignal()
      .filter(
        (s) =>
          s.status === 'active' &&
          s.deadline !== undefined &&
          s.deadline <= cutoff
      )
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());
  });

  /** Returns or creates a persistent anonymous voter ID stored in localStorage. */
  getVoterId(): string {
    let id = localStorage.getItem(VOTER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VOTER_ID_KEY, id);
    }
    return id;
  }

  /** Checks whether the current voter has already voted in a given survey. */
  async hasVotedInSurvey(surveyId: number): Promise<boolean> {
    const survey = this.surveysSignal().find((s) => s.id === surveyId);
    if (!survey) return false;

    const questionIds = survey.questions.map((q) => q.id);
    if (questionIds.length === 0) return false;

    const { data } = await this.supabase
      .from('votes')
      .select('id')
      .eq('voter_id', this.getVoterId())
      .in('question_id', questionIds)
      .limit(1);

    return (data?.length ?? 0) > 0;
  }

  /** Loads all surveys with their questions, options and vote counts from Supabase. */
  async loadSurveys(): Promise<void> {
    const { data: surveysData, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !surveysData) return;

    const { data: questionsData } = await this.supabase
      .from('questions')
      .select('*')
      .order('order_index', { ascending: true });

    const { data: optionsData } = await this.supabase
      .from('options')
      .select('*');

    const { data: votesData } = await this.supabase
      .from('votes')
      .select('option_id');

    const voteCounts: Record<number, number> = {};
    for (const vote of votesData ?? []) {
      voteCounts[vote.option_id] = (voteCounts[vote.option_id] ?? 0) + 1;
    }

    const surveys: Survey[] = surveysData.map((row) => {
      const questions = (questionsData ?? [])
        .filter((q) => q.survey_id === row.id)
        .map((q) => ({
          id: q.id as number,
          text: q.text as string,
          allowMultiple: q.allow_multiple as boolean,
          options: (optionsData ?? [])
            .filter((o) => o.question_id === q.id)
            .map((o) => ({
              id: o.id as number,
              label: o.label as string,
              text: o.text as string,
              votes: voteCounts[o.id as number] ?? 0,
            })),
        }));

      return {
        id: row.id as number,
        title: row.title as string,
        description: (row.description as string) ?? undefined,
        deadline: row.deadline ? new Date(row.deadline as string) : undefined,
        category: (row.category as string) ?? undefined,
        status: row.status as Survey['status'],
        createdAt: new Date(row.created_at as string),
        questions,
      };
    });

    this.surveysSignal.set(surveys);
  }

  /** Returns a survey by its ID, or undefined if not found. */
  getSurveyById(id: number): Survey | undefined {
    return this.surveysSignal().find((s) => s.id === id);
  }

  /** Creates a new survey with its questions and options in Supabase. */
  async createSurvey(data: CreateSurveyData): Promise<void> {
    const { data: surveyRow, error } = await this.supabase
      .from('surveys')
      .insert({
        title: data.title,
        description: data.description ?? null,
        deadline: data.deadline ?? null,
        category: data.category ?? null,
        status: 'active',
      })
      .select('id')
      .single();

    if (error || !surveyRow) return;

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];

      const { data: questionRow } = await this.supabase
        .from('questions')
        .insert({
          survey_id: surveyRow.id,
          text: q.text,
          allow_multiple: q.allowMultiple,
          order_index: i,
        })
        .select('id')
        .single();

      if (!questionRow) continue;

      await this.supabase.from('options').insert(
        q.options.map((o) => ({
          question_id: questionRow.id,
          label: o.label,
          text: o.text,
        }))
      );
    }

    await this.loadSurveys();
  }

  /** Records a vote for a specific option in a question. */
  async vote(questionId: number, optionId: number): Promise<void> {
    await this.supabase.from('votes').insert({
      option_id: optionId,
      question_id: questionId,
      voter_id: this.getVoterId(),
    });
  }

  private votesChannel: ReturnType<typeof this.supabase.channel> | null = null;

  /** Subscribes to real-time vote inserts and reloads surveys on change. */
  subscribeToVotes(): void {
    this.votesChannel = this.supabase
      .channel('votes-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => { this.loadSurveys(); }
      )
      .subscribe();
  }

  /** Unsubscribes from the real-time votes channel. */
  unsubscribeFromVotes(): void {
    if (this.votesChannel) {
      this.supabase.removeChannel(this.votesChannel);
      this.votesChannel = null;
    }
  }
}
