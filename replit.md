# Overview

This is a full-stack feedback management system called "FeedbackFlow" that provides sentiment analysis capabilities for customer feedback. The application allows users to create customizable feedback forms, collect responses, and analyze sentiment using AI. It features brand template management, real-time analytics dashboard, and comprehensive feedback visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type-safe UI development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, caching, and data synchronization
- **shadcn/ui** component library built on Radix UI primitives for consistent, accessible components
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Chart.js** for data visualization and analytics charts

## Backend Architecture
- **Express.js** server with TypeScript for REST API endpoints
- **Memory-based storage** with interface-driven design (IStorage) for easy database swapping
- **Middleware-based architecture** for request logging, error handling, and JSON processing
- **Modular route organization** with centralized route registration
- **Development-specific Vite integration** for hot module replacement and asset serving

## Data Management
- **Drizzle ORM** with PostgreSQL dialect for type-safe database operations
- **Zod schemas** for runtime validation and type inference
- **Shared schema definitions** between frontend and backend via `@shared/schema`
- **JSON field types** for flexible form field definitions and response storage
- **UUID primary keys** with database-generated defaults

## Authentication & Session Management
- **connect-pg-simple** for PostgreSQL-backed session storage
- **Express session middleware** for stateful authentication
- User role-based access control with admin/user distinctions

## AI Integration
- **OpenAI GPT-4o** for sentiment analysis of feedback text
- **Structured JSON responses** for consistent sentiment scoring and categorization
- **Confidence scoring** and automatic fallback handling for API failures
- **Category classification** for organizing feedback by topic (Product Quality, Customer Service, etc.)

## External Dependencies

### Database & Storage
- **Neon Database** (@neondatabase/serverless) for PostgreSQL hosting
- **Drizzle Kit** for database migrations and schema management
- **connect-pg-simple** for session storage in PostgreSQL

### AI & Analytics
- **OpenAI API** for sentiment analysis and text classification
- **Chart.js** for dashboard visualizations and analytics charts

### UI & Styling
- **Radix UI** component primitives for accessibility and interaction patterns
- **Tailwind CSS** with custom design system integration
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod resolvers for form validation

### Development & Build Tools
- **Vite** for development server and production builds
- **ESBuild** for server-side bundling
- **TypeScript** for type safety across the full stack
- **Replit integration** for development environment and deployment