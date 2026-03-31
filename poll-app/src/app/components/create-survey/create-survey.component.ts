import { Component, inject, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { SurveyService } from '../../services/survey.service';

type OptionForm = FormGroup<{
  text: FormControl<string>;
}>;

type QuestionForm = FormGroup<{
  text: FormControl<string>;
  allowMultiple: FormControl<boolean>;
  options: FormArray<OptionForm>;
}>;

type SurveyForm = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  deadline: FormControl<string>;
  category: FormControl<string>;
  questions: FormArray<QuestionForm>;
}>;

const OPTION_LABEL_ASCII_START = 65;

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class CreateSurveyComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);

  @Output() closed = new EventEmitter<void>();
  @Output() surveyCreated = new EventEmitter<void>();

  protected readonly categories: readonly string[] = [
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Healthy Lifestyle',
    'Technology & Innovation',
    'Education & Learning',
  ];

  protected form!: SurveyForm;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      deadline: [''],
      category: [''],
      questions: this.fb.array([this.createQuestionGroup()]),
    }) as SurveyForm;
  }

  /** Returns the questions FormArray. */
  get questions(): FormArray<QuestionForm> {
    return this.form.controls.questions;
  }

  /** Returns the options FormArray for a given question index. */
  getOptions(questionIndex: number): FormArray<OptionForm> {
    return this.questions.at(questionIndex).controls.options;
  }

  /** Returns the letter label (A, B, C…) for an option at the given index. */
  getOptionLabel(index: number): string {
    return String.fromCharCode(OPTION_LABEL_ASCII_START + index);
  }

  /** Adds a new question to the form. */
  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  /** Removes the question at the given index, if more than one exists. */
  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  /** Adds a new answer option to the question at the given index. */
  addOption(questionIndex: number): void {
    this.getOptions(questionIndex).push(this.createOptionGroup());
  }

  /** Removes an answer option from a question, if more than two exist. */
  removeOption(questionIndex: number, optionIndex: number): void {
    if (this.getOptions(questionIndex).length > 2) {
      this.getOptions(questionIndex).removeAt(optionIndex);
    }
  }

  /** Returns true if a form field is invalid and has been touched. */
  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  /** Submits the survey form and emits creation/close events on success. */
  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;

    this.surveyService.createSurvey({
      title: value.title!,
      description: value.description || undefined,
      deadline: value.deadline ? new Date(value.deadline) : undefined,
      category: value.category || undefined,
      questions: (value.questions ?? []).map((q, qIndex) => ({
        id: qIndex + 1,
        text: q.text!,
        allowMultiple: q.allowMultiple ?? false,
        options: this.buildOptions(q.options ?? [], qIndex),
      })),
    });

    this.surveyCreated.emit();
    this.closed.emit();
  }

  /** Emits the closed event to dismiss the modal. */
  onClose(): void {
    this.closed.emit();
  }

  private buildOptions(
    options: Array<{ text?: string | null }>,
    questionIndex: number,
  ): Array<{ id: number; label: string; text: string; votes: number }> {
    return options.map((opt, optIndex) => ({
      id: optIndex + 1,
      label: this.getOptionLabel(optIndex),
      text: opt.text!,
      votes: 0,
    }));
  }

  private createQuestionGroup(): QuestionForm {
    return this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      options: this.fb.array([
        this.createOptionGroup(),
        this.createOptionGroup(),
      ]),
    }) as QuestionForm;
  }

  private createOptionGroup(): OptionForm {
    return this.fb.group({
      text: ['', Validators.required],
    }) as OptionForm;
  }
}
