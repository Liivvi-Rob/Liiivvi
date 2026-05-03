# Liivvi - AI-Powered Real Estate Platform

Liivvi is a modern real estate platform built with React, TypeScript, and Vite. It features AI-powered property descriptions, real-time messaging, and seamless property management.

## Compatibility with Airo Site

This Liivvi app is designed to work alongside the existing Airo-built website as a shared backend solution:

- **Airo Site**: Public marketing website and property previews
- **Liivvi App**: Full CRUD operations for properties, admin dashboard, messaging, and scheduling
- **Shared Backend**: Both connect to the same Supabase project

## Features

- Property listings with AI-generated descriptions
- Real-time messaging between buyers and sellers
- Calendar-based showing scheduler
- Admin dashboard for listing management
- AI assistant chat widget for natural language search
- Google Maps address autocomplete
- Mobile-first responsive design

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: OpenAI API
- **Maps**: Google Maps API

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd liivvi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys (same as Airo site):
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `VITE_OPENAI_API_KEY`: Your OpenAI API key
     - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

See `SUPABASE_SCHEMA.md` for complete database documentation, including:
- Table structures
- RLS policies
- Migration SQL
- Integration points

## Shared Routes

Liivvi provides these routes that Airo site can link to:

- `/listings` - Property listings grid
- `/listing/:id` - Property detail page
- `/create-listing` - Create new property listing
- `/schedule/:propertyId` - Schedule property showing
- `/messages/:propertyId` - Property messaging
- `/admin` - Admin dashboard

### Example Airo Site Integration

```html
<!-- Link to property listings -->
<a href="https://liivvi-app.vercel.app/listings">View All Properties</a>

<!-- Link to specific property -->
<a href="https://liivvi-app.vercel.app/listing/123">View Property</a>

<!-- Link to create listing -->
<a href="https://liivvi-app.vercel.app/create-listing">List Your Property</a>
```

## Deployment

This app is configured for deployment on Vercel. Make sure all environment variables are set in your Vercel project settings.

### Vercel Deployment Steps

1. **Connect Repository**: 
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**:
   Add these in Vercel project settings:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key  
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

4. **Deploy**: Click "Deploy" and wait for completion

### Deployment Checklist

- [ ] Supabase URL added to Vercel environment variables
- [ ] Supabase anonymous key added to Vercel environment variables  
- [ ] OpenAI API key added to Vercel environment variables
- [ ] Google Maps API key added to Vercel environment variables
- [ ] Production URL added to Supabase allowed origins (if needed)
- [ ] Vercel build passes successfully
- [ ] All routes work correctly (test `/listings`, `/listing/:id`, etc.)
- [ ] Supabase RLS policies allow public access for required operations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── lib/           # Utility libraries (Supabase, OpenAI)
├── pages/         # Page components
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
