# What We Have Done & How We Did It - StudyQ

## 1. Project Conception & Objectives
We successfully built **StudyQ**, a full-stack AI-powered study assistant designed to transform PDF study materials into interactive quizzes, automatic notes, and actionable analytics. The main objective was to seamlessly bridge modern web development with Generative AI (Google Gemini 1.5) to empower students.

## 2. Core Features Developed
- **PDF Upload & Text Processing**: Implemented a drag-and-drop interface for users to upload study materials (PDFs). We then extract raw text from these PDFs for downstream AI context.
- **AI Content Generation**: Leveraged the Gemini API to automatically read the extracted text and generate 10 Multiple-Choice Questions (MCQs) in a strict JSON structure, alongside concise study notes.
- **Interactive Quizzes**: Created a paginated interface for students to attempt the generated MCQs, tracking selected answers securely.
- **Performance Analytics**: Visualized students' accuracy, attempt history, and improvement trends using tables and interactive graphs.
- **Secure Authentication**: Built a secure user system utilizing JWT (JSON Web Tokens) and bcrypt password hashing.

## 3. Technology Stack & Implementation Details
We chose a modern, separated architecture with distinct Frontend, Backend, and AI layers:

### Frontend Layer
- **React.js & Vite**: Provided a fast, component-based Single Page Application setup.
- **Tailwind CSS**: Ensured quick, responsive, and modern styling across the dashboard.
- **Three.js**: Integrated to add engaging, dynamic 3D elements to our landing page, creating a premium feel.
- **Recharts**: Utilized for drawing data visualizations based on user performance.

### Backend Layer
- **Flask (Python)**: Established a solid, lightweight framework for our REST API handles requests.
- **SQLAlchemy & PyMySQL**: Used as the ORM to interact with our **MySQL** database (adapted from initial Postgres plans).
- **PyMuPDF (fitz)**: Chosen for its speed and reliability in extracting text from user-uploaded PDFs.
- **Google GenAI**: Configured strict system prompts to interface with the Gemini models, ensuring the AI strictly returns parseable JSON quizzes.

## 4. Development Workflow & Phased Methodology
Our implementation followed a highly structured, phased approach (as outlined in `claude.md`):

1. **Phase 1 (Core Setup)**: Initialized the Flask backend, set up the MySQL database schemas via SQLAlchemy (Users, Documents, Quizzes, Questions, Attempts), and built the JWT-based registration/login routes.
2. **Phase 2 (File Handling)**: Configured PDF upload routes to validate files, utilize PyMuPDF for extraction, and persist the extracted text.
3. **Phase 3 (Prompt Engineering & AI)**: Fine-tuned prompts targeting the Gemini API. We enforced strict AI requirements: 10 MCQs, 4 options per question, one correct answer, and un-formatted JSON output—giving the backend an easy way to parse and store the generated questions.
4. **Phase 4 & 5 (Evaluation & Analytics)**: Built endpoints `/quizzes` and `/analytics` to receive user quiz submissions, grade them against the correct option, and aggregate this data over time into an accuracy percentage.
5. **Phase 6 (UI Integration)**: Wired up React components to consume our API endpoints, implemented state management, and finalized the UI logic.

By executing the project in this sequence, we ensured each foundational pillar (Authentication -> Database -> Storage) was rigid before integrating complex external services (AI generation) and connecting the React frontend viewing logic.
