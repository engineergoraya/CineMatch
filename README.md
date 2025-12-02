🎬 Netflix-Style Streaming Discovery Platform
An advanced, production-grade Movie and TV Series discovery platform engineered to mimic the premium experience of services like Netflix. This project showcases expertise in secure serverless architecture, complex API aggregation, real-time data handling, and high-performance frontend development.

🔥 Project Highlights (Architectural & Technical Scope)
This application is built as a Multi-Agent System that securely handles complex data requests and delivers a fluid user experience:

Secure Serverless Proxy (λ): All external TMDB API calls are routed through a custom Vercel Serverless Function (/api/tmdb.js). This ensures the TMDB_API_KEY is secured as an environment variable, meeting industry standards for API key security.

Advanced API Aggregation: Implements Multi-Search (/search/multi) to simultaneously query Movies, TV Shows, and Actors/People. The system also aggregates data across /discover, /trending, and specific /videos and /credits endpoints for deep content detail.

High-Performance UI/UX: Features a Netflix-style dark UI, dynamic Horizontal Carousels (Trending, Top Rated, Pakistani Picks, etc.), and smooth Infinite Scroll for seamless content discovery.

Real-Time Data Features: Includes a debounced, real-time suggestion search that provides instant auto-complete results as the user types, enhancing search efficiency.

Enhanced Media Playback: The detailed modal automatically fetches and autoplays the official YouTube trailer for selected titles.

🛠️ Tech Stack & Implementation
Category	Technology	Implementation Detail
Frontend	HTML5, CSS3, JavaScript	Custom dark theme UI with Poppins font and full responsiveness.
Architecture	Vercel Serverless Functions	Securely proxies all API requests, handles environment variables, and ensures fast cold starts.
Core Logic	Custom JavaScript	Implements Debouncing for search, Throttling for infinite scroll, and complex DOM manipulation for the modal and carousels.
Data Source	TMDB API (The Movie Database)	Used for all content and metadata.
Features	Carousels, Infinite Scroll, Modals	Custom-built, lightweight components—no heavy external UI libraries used.

Export to Sheets

🚀 Installation & Deployment
This project is built for seamless deployment on Vercel.

1. Prerequisites
A free TMDB API Key.

A free Vercel account linked to your GitHub repository.

2. Vercel Deployment Steps
Clone the Repository:

Bash

git clone [Your Repository URL]
Deploy Project: Import the repository into your Vercel dashboard. Vercel will automatically recognize and build the /api/tmdb.js serverless function.

Set Environment Variable (CRITICAL SECURITY STEP):

In the Vercel dashboard settings for your project, navigate to Settings → Environment Variables.

Add a new variable:

Name: TMDB_API_KEY

Value: Paste your actual TMDB API secret key.

Re-deploy the project for the environment variable to take effect.

💡 System Functionality
The application flow highlights advanced frontend-to-backend communication:

UI Interaction: User scrolls, triggers infinite scroll, or types into the debounced search bar.

Client Request: JavaScript constructs a request URL (e.g., /api/tmdb?endpoint=...) but does not include the API key.

Serverless Proxy: The Vercel function receives the request, server-side appends the secure TMDB_API_KEY from its environment, fetches the data from TMDB, and returns the clean JSON to the client.

Data Rendering: The frontend processes the JSON, shuffles results, and renders them into responsive card grids or horizontal carousels with smooth fade-in animations.

👨‍💻 Author
(Abdul Raheem Goraya) – Computer Engineering Student, GIKI.
