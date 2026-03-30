# Requirements – PollApp

Ermittelt aus dem Quellcode (Stand: 2026-03-30).

---

## 1. Technischer Stack

| Bereich | Technologie | Version |
|---|---|---|
| Framework | Angular (Standalone Components) | 21.2 |
| Sprache | TypeScript | ~5.9 |
| Styling | SCSS | – |
| State Management | Angular Signals | – |
| Forms | Reactive Forms | – |
| Routing | Angular Router (Lazy Loading) | – |
| Build | @angular/build (esbuild) | ^21.2 |
| Tests | Vitest | ^4.0 |
| Code Style | Prettier | ^3.8 |
| Laufzeit | Node.js / npm 10.9 | – |

### Schriftarten (Fontsource)
- **Nerko One** – Überschriften
- **Mulish** – Fließtext / UI-Text
- **Nokora** – Buttons

---

## 2. Routen / Seiten

| Route | Komponente | Beschreibung |
|---|---|---|
| `/` | `HomeComponent` | Dashboard: Umfragen-Übersicht, Filter, Carousel |
| `/survey/create` | `CreateSurveyPageComponent` | Formular zum Erstellen einer neuen Umfrage |
| `/survey/:id` | `SurveyDetailComponent` | Detailansicht, Abstimmung, Ergebnisse |

---

## 3. Datenmodell

```
Survey
├── id: number
├── title: string                 (Pflichtfeld, min. 3 Zeichen)
├── description?: string
├── deadline?: Date
├── category?: string
├── status: 'active' | 'closed' | 'draft'
├── createdAt: Date
└── questions: Question[]

Question
├── id: number
├── text: string
├── allowMultiple: boolean        (Einfach- oder Mehrfachauswahl)
└── options: Option[]

Option
├── id: number
├── label: string                 (A, B, C …)
├── text: string
└── votes: number
```

---

## 4. Funktionale Anforderungen

### 4.1 Implementiert ✅

#### Home / Dashboard
- [x] Liste aller aktiven Umfragen (Tab „Active survey")
- [x] Liste aller vergangenen Umfragen (Tab „Past survey")
- [x] „Ending soon"-Carousel: Umfragen, die in ≤ 7 Tagen enden, sortiert nach Deadline
- [x] Filter: Kategorie über Dropdown auswählen
- [x] Navigation zur Detailansicht per Klick auf Umfrage
- [x] Button zum Öffnen des Erstellungsformulars

#### Umfrage erstellen
- [x] Pflichtfeld: Titel (min. 3 Zeichen)
- [x] Optionale Felder: Beschreibung, Deadline, Kategorie
- [x] Dynamisch Fragen hinzufügen / entfernen
- [x] Dynamisch Antwortoptionen pro Frage hinzufügen / entfernen
- [x] Einzel- oder Mehrfachauswahl pro Frage konfigurierbar
- [x] Formularvalidierung mit Fehlermeldungen
- [x] Nach Absenden: Navigation zurück zur Startseite

#### Umfrage abstimmen
- [x] Fragen und Optionen anzeigen
- [x] Einzel- und Mehrfachauswahl-Abstimmung
- [x] Abstimmen verhindert, wenn Umfrage geschlossen ist
- [x] Abstimmen verhindert, wenn bereits abgestimmt wurde (UI-State)
- [x] Abstimmung aktualisiert Votes in der Service-Schicht

#### Ergebnisse anzeigen
- [x] Prozentbalkendarstellung nach Abstimmung
- [x] Gesamtstimmen pro Option
- [x] Platzhalter-Ansicht vor erster Abstimmung
- [x] Ergebnisse pro Frage aufgelistet

#### Navigation
- [x] Client-seitiges Routing mit Lazy Loading
- [x] Zurück-Navigation aus Detailansicht
- [x] Route-Parameter für Umfrage-IDs

---

### 4.2 Offen / Geplant ❌

#### Backend & Persistenz
- [ ] REST-API-Integration (HTTP-Service)
- [ ] Datenbankanbindung (Umfragen persistent speichern)
- [ ] Umfragedaten überleben einen Seitenneulad

#### Authentifizierung & Benutzerverwaltung
- [ ] Benutzer-Login / Registrierung
- [ ] Benutzeridentifikation für Vote-Tracking (aktuell nur UI-State)
- [ ] Rollen: Ersteller vs. Teilnehmer
- [ ] „Meine Umfragen"-Ansicht pro Benutzer

#### Umfrage-Verwaltung
- [ ] Umfrage bearbeiten nach Erstellung
- [ ] Umfrage löschen
- [ ] Umfrage manuell schließen (vor Deadline)
- [ ] Umfrage als Entwurf speichern und später veröffentlichen
- [ ] Umfrage teilen (öffentlicher Link)

#### Erweiterte Features
- [ ] Umfrage-Vorlagen
- [ ] Offene Textantworten (Freitextfeld)
- [ ] Verzweigungslogik / bedingte Fragen
- [ ] Kommentar-/Feedback-Felder
- [ ] Export der Ergebnisse (CSV, PDF)
- [ ] E-Mail-Benachrichtigungen (z. B. bei Ablauf der Deadline)
- [ ] Statistik-Dashboard / Analytics

#### Technische Verbesserungen
- [ ] Pagination / Virtual Scrolling (bei vielen Umfragen)
- [ ] Caching-Strategie (HTTP-Cache, Service Worker)
- [ ] Lazy Image Loading
- [ ] Fehlerbehandlung / Error Boundaries
- [ ] Ladezustände (Skeleton Loader, Spinner)
- [ ] Toast-Benachrichtigungen (Erfolg / Fehler)
- [ ] `Survey.totalVotes` implementieren (Feld deklariert, aber ungenutzt)

#### Bereinigung
- [ ] `CreateSurveyComponent` (`src/app/components/create-survey/`) entfernen oder reaktivieren – aktuell ungenutzt, Duplikat von `CreateSurveyPageComponent`

---

## 5. Nicht-funktionale Anforderungen

### 5.1 Responsives Design
- Mobile-First: Primäres Breakpoint bei **≤ 480 px** (Figma-Referenz: 375 px)
- Desktop: Basis-Layout ab 900 px aufwärts
- Interne Breakpoints: 900 px (Grid-Umschaltung 2 → 1 Spalte)

### 5.2 Performance
- Build-Budgets (angular.json):
  - Initial Bundle: Warnung ≥ 500 kB, Fehler ≥ 1 MB
  - Komponenten-Styles: Warnung ≥ 4 kB, Fehler ≥ 8 kB
- Alle Seiten lazy-loaded

### 5.3 Code-Qualität
- Linter / Formatter: Prettier
- Komponenten-Prefix: `app`
- Style-Sprache: SCSS (mit globalem `styles.scss` als Basis)
- Architektur: Standalone Components, keine NgModules

### 5.4 Tests
- Test-Runner: Vitest
- Aktueller Stand: Keine Tests vorhanden (nur leere `app.spec.ts`)
- Ziel: Unit-Tests für Service-Schicht und Kernkomponenten

---

## 6. Service-Schicht (aktuell)

### `SurveyService`
| Signal / Methode | Beschreibung |
|---|---|
| `surveysSignal` | Alle Umfragen (initialisiert mit Mock-Daten) |
| `activeSurveys` | Computed: Status === 'active' |
| `pastSurveys` | Computed: Status === 'closed' |
| `endingSoon` | Computed: aktiv + Deadline ≤ 7 Tage, sortiert |
| `getSurveyById(id)` | Einzelne Umfrage per ID |
| `createSurvey(data)` | Neue Umfrage anlegen (generierte ID, Status 'active') |
| `vote(surveyId, questionId, optionId)` | Vote inkrementieren |

---

## 7. Offene Codestellen

| Datei | Problem |
|---|---|
| `src/app/components/create-survey/` | Komponente existiert, wird nirgends verwendet |
| `src/app/models/survey.model.ts` | `totalVotes?: number` deklariert, aber nie befüllt/genutzt |
| `src/app/app.spec.ts` | Testdatei leer – keine Tests implementiert |
