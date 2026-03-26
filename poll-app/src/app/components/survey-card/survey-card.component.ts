import { Component, input, output } from '@angular/core';

import { Survey } from '../../models/survey.model';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-survey-card',
  templateUrl: './survey-card.component.html',
  styleUrl: './survey-card.component.scss',
  standalone: true,
  imports: [],
})
export class SurveyCardComponent {
  survey = input.required<Survey>();
  cardClicked = output<number>();

  /** Returns the number of days remaining until the survey deadline. */
  get daysLeft(): number {
    if (!this.survey().deadline) return 0;
    const diff = this.survey().deadline!.getTime() - new Date().getTime();
    return Math.ceil(diff / MS_PER_DAY);
  }

  /** Emits the survey ID when the card is clicked. */
  onCardClick(): void {
    this.cardClicked.emit(this.survey().id);
  }
}
