import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { SurveyService } from '../../services/survey.service';
import { Survey, Question, Option } from '../../models/survey.model';

type VoteState = Record<number, number[]>;

const PERCENTAGE_BASE = 100;

@Component({
  selector: 'app-survey-detail',
  templateUrl: './survey-detail.component.html',
  styleUrl: './survey-detail.component.scss',
  standalone: true,
  imports: [DatePipe],
})
export class SurveyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  protected survey = signal<Survey | null>(null);
  protected hasVoted = signal<boolean>(false);
  protected selectedOptions = signal<VoteState>({});
  protected resultsOpen = signal<boolean>(true);

  protected toggleResults(): void {
    this.resultsOpen.update(v => !v);
  }

  protected canSubmit = computed(() => {
    const survey = this.survey();
    if (!survey) return false;
    const state = this.selectedOptions();
    return survey.questions.every((question) => {
      const chosen = state[question.id];
      return chosen !== undefined && chosen.length > 0;
    });
  });

  /** Initializes the component by loading the survey from the route parameter. */
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['']);
      return;
    }

    const id = Number(idParam);
    const found = this.surveyService.getSurveyById(id);
    this.survey.set(found ?? null);

    if (found?.status === 'closed') {
      this.hasVoted.set(true);
    }
  }

  /** Toggles an answer option selection for a question. */
  toggleOption(question: Question, optionId: number): void {
    if (this.hasVoted() || this.survey()?.status === 'closed') return;

    this.selectedOptions.update((state) => {
      const currentChoices = state[question.id] ?? [];
      let newChoices: number[];

      if (question.allowMultiple) {
        const isAlreadySelected = currentChoices.includes(optionId);
        newChoices = isAlreadySelected
          ? currentChoices.filter((id) => id !== optionId)
          : [...currentChoices, optionId];
      } else {
        newChoices = [optionId];
      }

      return { ...state, [question.id]: newChoices };
    });
  }

  /** Returns whether a specific option is currently selected. */
  isSelected(questionId: number, optionId: number): boolean {
    const choices = this.selectedOptions()[questionId];
    return choices?.includes(optionId) ?? false;
  }

  /** Submits the vote and refreshes the survey results. */
  submitVote(): void {
    if (!this.canSubmit()) return;
    const survey = this.survey();
    if (!survey) return;

    const state = this.selectedOptions();
    Object.entries(state).forEach(([questionIdStr, optionIds]) => {
      const questionId = Number(questionIdStr);
      optionIds.forEach((optionId) => {
        this.surveyService.vote(survey.id, questionId, optionId);
      });
    });

    this.hasVoted.set(true);
    this.survey.set(this.surveyService.getSurveyById(survey.id) ?? null);
  }

  /** Returns the vote percentage for a specific option within a question. */
  getVotePercentage(question: Question, option: Option): number {
    const totalVotes = question.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * PERCENTAGE_BASE);
  }

  /** Returns the total number of votes across all options in a question. */
  getTotalVotesForQuestion(question: Question): number {
    return question.options.reduce((sum, opt) => sum + opt.votes, 0);
  }

  /** Returns the highest vote percentage among all options of a question. */
  getWinnerPercentage(question: Question): number {
    const percentages = question.options.map((opt) =>
      this.getVotePercentage(question, opt)
    );
    return Math.max(...percentages);
  }

  /** Navigates back to the home page. */
  goBack(): void {
    this.router.navigate(['']);
  }
}
