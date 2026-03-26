import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

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
  selector: 'app-create-survey-page',
  templateUrl: './create-survey-page.component.html',
  styleUrl: './create-survey-page.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class CreateSurveyPageComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

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

  /** Returns the letter label for an option based on its index. */
  getOptionLabel(index: number): string {
    return String.fromCharCode(OPTION_LABEL_ASCII_START + index);
  }

  /** Adds a new question to the form. */
  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  /** Removes a question from the form at the given index. */
  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  /** Adds a new answer option to the question at the given index. */
  addOption(questionIndex: number): void {
    this.getOptions(questionIndex).push(this.createOptionGroup());
  }

  /** Removes an answer option from a question. */
  removeOption(questionIndex: number, optionIndex: number): void {
    if (this.getOptions(questionIndex).length > 2) {
      this.getOptions(questionIndex).removeAt(optionIndex);
    }
  }

  /** Submits the survey form and navigates to the home page. */
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
    this.router.navigate(['']);
  }

  /** Navigates back to the home page without saving. */
  goBack(): void {
    this.router.navigate(['']);
  }

  /** Clears the value of a top-level form field. */
  clearField(controlName: string): void {
    this.form.get(controlName)?.setValue('');
  }

  /** Clears the text input of a question at the given index. */
  clearQuestionText(i: number): void {
    this.questions.at(i).get('text')?.setValue('');
  }

  /** Clears the text input of an option within a question. */
  clearOptionText(i: number, j: number): void {
    this.getOptions(i).at(j).get('text')?.setValue('');
  }

  /** Returns true if a form field is invalid and has been touched. */
  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && control?.touched);
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
