import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { SurveyService } from '../../services/survey.service';
import { SurveyCardComponent } from '../../components/survey-card/survey-card.component';
import { SurveyListItemComponent } from '../../components/survey-list-item/survey-list-item.component';

type ActiveTab = 'active' | 'past';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [
    SurveyCardComponent,
    SurveyListItemComponent,
  ],
})
export class HomeComponent {
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  protected activeTab = signal<ActiveTab>('active');
  protected selectedCategory = signal<string | null>(null);
  protected sortOpen = signal(false);

  protected readonly endingSoon = this.surveyService.endingSoon;
  protected readonly activeSurveys = this.surveyService.activeSurveys;
  protected readonly pastSurveys = this.surveyService.pastSurveys;

  protected readonly categories = computed(() => {
    const all = [...this.activeSurveys(), ...this.pastSurveys()];
    return [...new Set(all.map((s) => s.category).filter((c): c is string => !!c))];
  });

  protected readonly filteredActive = computed(() => {
    const cat = this.selectedCategory();
    return cat ? this.activeSurveys().filter((s) => s.category === cat) : this.activeSurveys();
  });

  protected readonly filteredPast = computed(() => {
    const cat = this.selectedCategory();
    return cat ? this.pastSurveys().filter((s) => s.category === cat) : this.pastSurveys();
  });

  /** Sets the active tab to either active or past surveys. */
  setActiveTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  /** Selects a category filter and closes the sort dropdown. */
  selectCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.sortOpen.set(false);
  }

  /** Toggles the visibility of the sort dropdown. */
  toggleSort(): void {
    this.sortOpen.update((v) => !v);
  }

  /** Navigates to the detail page of a survey. */
  navigateToSurvey(surveyId: number): void {
    this.router.navigate(['survey', surveyId]);
  }

  /** Navigates to the create survey page. */
  openCreateSurvey(): void {
    this.router.navigate(['survey', 'create']);
  }
}
