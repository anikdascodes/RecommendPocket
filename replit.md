# AudioVibe - AI-Powered Audio Content Platform

## Overview

AudioVibe is a modern full-stack web application that provides personalized audio content recommendations. The platform features an onboarding flow for user preferences, content browsing with category filtering, search functionality, and AI-powered recommendations. Built with React, Express, and PostgreSQL, it uses modern UI components and a sophisticated architecture for delivering a seamless user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom dark theme design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API with JSON responses
- **Storage**: Dual storage implementation (in-memory for development, database-ready for production)
- **Middleware**: Custom logging, error handling, and request/response processing

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL
- **Development Storage**: In-memory storage with sample data for rapid development

## Key Components

### User Experience Flow
1. **Loading Screen**: Branded loading experience with AudioVibe branding
2. **Onboarding Process**: Multi-step preference collection (genres, session duration)
3. **Main Application**: Content browsing, filtering, search, and recommendations

### Core Features
- **Content Management**: Audio content with metadata (title, description, category, duration, rating)
- **User Preferences**: Genre selection and session duration preferences
- **Search & Filter**: Real-time content search and category-based filtering
- **AI Recommendations**: Personalized content suggestions based on user preferences

### UI Component System
- **Design System**: Custom dark theme with gradient accents
- **Component Library**: Comprehensive Radix UI component set
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation

## Data Flow

### User Onboarding
1. User selects preferred genres from predefined categories
2. User chooses preferred session duration (short/medium/long)
3. Preferences are validated and saved to backend
4. User is redirected to main application with personalized experience

### Content Discovery
1. Application fetches all content from `/api/content` endpoint
2. Content is filtered based on selected category and search query
3. Real-time search queries content using `/api/content/search`
4. Category filtering uses `/api/content/category/:category`

### Recommendation System
1. AI recommendations generated based on user preferences
2. Recommendations include reasoning and confidence scores
3. Content suggestions are personalized and contextual

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI & Styling
- **@radix-ui/***: Comprehensive accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: In-memory storage for rapid prototyping
- **Replit Integration**: Custom plugins for development experience

### Production Build
- **Frontend**: Vite production build with code splitting and optimization
- **Backend**: ESBuild compilation to single JavaScript bundle
- **Database**: PostgreSQL with Drizzle migrations
- **Deployment**: Node.js server serving static assets and API endpoints

### Environment Configuration
- **Development**: `NODE_ENV=development` with file watching and hot reload
- **Production**: `NODE_ENV=production` with optimized builds and static serving
- **Database**: `DATABASE_URL` environment variable for PostgreSQL connection

### Build Process
1. Frontend assets compiled and optimized by Vite
2. Backend TypeScript compiled to ESM bundle
3. Static assets served from `dist/public`
4. API routes handled by Express server
5. Database schema managed through Drizzle migrations