# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an amateur radio exam study website that provides practice questions, mock exams, and error book features for Chinese amateur radio license examinations. The project supports three classes of licenses: A, B, and C, with corresponding question banks.

## Architecture & Structure

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API (in src/contexts/HamExamContext)
- **Local Storage**: For persisting wrong answers and user progress

### Directory Structure:
- `src/`: Main source code
  - `components/`: React components organized by feature (layout, home, practice, exam, wrong book)
  - `contexts/`: React Context providers (HamExamContext manages global state)
  - `data/`: Question data files (questions_A.ts, questions_B.ts, questions_C.ts)
  - `styles/`: Additional CSS files
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `docs/`: Raw question bank files in text format
- `scripts/`: Data processing scripts (Python and JavaScript)

## Key Features

- Responsive design for mobile/tablet/desktop
- Practice mode: sequential question answering with explanations
- Mock exam: timed 40-question exam (32 single + 8 multiple choice) with 40-minute timer
- Wrong book: tracks incorrect answers for repeated practice
- Knowledge point categorization: 11 topic areas like radio regulation, frequency management, antenna basics, etc.
- Local storage persistence for user data

## Question Data Format

Questions are stored in TypeScript files under `src/data/` with the structure:
```typescript
{
  id: "[LY0001:MC2-0001]",    // Internal ID with question type
  topic: "无线电管理",         // Knowledge category
  content: "Question text...", // Question content
  options: ["A. Option 1", "B. Option 2", ...], // Answer options
  answer: "CD",               // Correct answer (for multiple choice)
  explanation: "",            // Answer explanation
  attachment: ""              // Optional image attachment
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3001)
npm run dev

# Build production version
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Question Bank Processing

### Python Parser Script (`scripts/parse_data_2_json.py`)
Converts raw text format question files to JavaScript data:
```bash
# Parse A class question bank
python3 scripts/parse_data_2_json.py -i docs/cq_class_A.txt -o src/data/questions_A.ts

# Parse B class question bank
python3 scripts/parse_data_2_json.py -i docs/cq_class_B.txt -o src/data/questions_B.ts

# Parse C class question bank
python3 scripts/parse_data_2_json.py -i docs/cq_class_C.txt -o src/data/questions_C.ts
```

### Question Shuffling Script
Randomizes answer options while maintaining correct answer mapping:
```bash
node shuffle_questions.js
```

## Raw Data Format

Raw question files in `docs/` follow this format:
```
[J] Internal ID
[P] Chapter/Section
[I] Multi-choice group number (MC=multi, MC1=single, MC2=two selected, etc.)
[Q] Question content
[T] Answer (multiple characters for multi-select)
[A] Option A content
[B] Option B content
[C] Option C content
[D] Option D content
[F] Attachment image (optional)
```

## Exam Rules

### A Class (Current Focus)
- 32 single-choice questions + 8 multi-choice questions
- 40 minutes time limit
- Pass: 30+ correct answers

### B Class
- 45 single-choice + 15 multi-choice
- 60 minutes time limit
- Pass: 45+ correct answers

### C Class
- 70 single-choice + 20 multi-choice
- 90 minutes time limit
- Pass: 70+ correct answers

## Key Components

- `HamExamContext`: Global state management for questions, user answers, and exam progress
- `Navbar`: Navigation component
- `Home`: Main landing page
- `Practice`: Sequential question practice mode
- `Exam`: Timed mock exam mode
- `WrongBook`: Review incorrectly answered questions

## Data Flow

1. Questions are loaded from `src/data/questions_A.ts` (or B/C)
2. HamExamContext manages the question state and user progress
3. User answers are compared with correct answers
4. Incorrect answers are saved to localStorage for the wrong book
5. Results are persisted locally using browser storage

## Special Considerations

- Questions with multiple correct answers use letters (e.g., "AC") for the answer field
- Image attachments are embedded in question content as HTML img tags
- Options are dynamically shuffled to prevent memorization of positions
- The app supports 11 different knowledge categories with automatic classification