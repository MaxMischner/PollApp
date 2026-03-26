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

  get questions(): FormArray<QuestionForm> {
    return this.form.controls.questions;
  }

  getOptions(questionIndex: number): FormArray<OptionForm> {
    return this.questions.at(questionIndex).controls.options;
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

  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  addOption(questionIndex: number): void {
    this.getOptions(questionIndex).push(this.createOptionGroup());
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    if (this.getOptions(questionIndex).length > 2) {
      this.getOptions(questionIndex).removeAt(optionIndex);
    }
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

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
        options: (q.options ?? []).map((opt, optIndex) => ({
          id: optIndex + 1,
          label: this.getOptionLabel(optIndex),
          text: opt.text!,
          votes: 0,
        })),
      })),
    });

    this.surveyCreated.emit();
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && control?.touched);
  }
}
