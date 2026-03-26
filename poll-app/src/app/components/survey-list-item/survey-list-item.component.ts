import { Component, input, output } from '@angular/core';

import { Survey } from '../../models/survey.model';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-survey-list-item',
  templateUrl: './survey-list-item.component.html',
  styleUrl: './survey-list-item.component.scss',
  standalone: true,
  imports: [],
})
export class SurveyListItemComponent {
  survey = input.required<Survey>();
  itemClicked = output<number>();

  /** Returns the number of days remaining until the survey deadline. */
  get daysLeft(): number {
    if (!this.survey().deadline) return 0;
    const diff = this.survey().deadline!.getTime() - new Date().getTime();
    return Math.ceil(diff / MS_PER_DAY);
  }

  /** Returns the formatted deadline date string. */
  get formattedDeadline(): string {
    if (!this.survey().deadline) return 'No deadline';
    return this.survey().deadline!.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /** Emits the survey ID on click if the survey is not closed. */
  onItemClick(): void {
    if (this.survey().status === 'closed') return;
    this.itemClicked.emit(this.survey().id);
  }
}
