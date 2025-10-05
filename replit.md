# JW Player Video Application

## Overview

This is a full-stack web application built for playing and downloading videos using the JW Player. The application features a React-based frontend with a modern UI built using shadcn/ui components and Tailwind CSS, paired with an Express backend. Users can input video URLs to either stream them directly in the browser or download them for offline viewing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and modern React features
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Client-side routing implemented with Wouter (lightweight alternative to React Router)

**UI Component System**
- shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with CSS variables for theming
- Dark theme with custom color scheme (primary color: crimson red HSL(348 83% 47%))
- Component variants managed through class-variance-authority (CVA)

**State Management**
- TanStack Query (React Query v5) for server state management and caching
- Custom hooks for UI interactions (toast notifications, mobile detection)
- React Hook Form with Zod resolvers for form validation

**Application Pages**
- Home page: Video URL input interface with play/download options
- Player page: Embedded JW Player for video playback with fallback CDN loading
- Route-based modes: `/Play/*` for streaming, `/Down/*` for downloading

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- ESM (ES Modules) module system throughout the application
- Custom middleware for request logging and JSON body parsing with raw body capture

**API Endpoints**
- `/api/download` - Video download handler (currently redirects to source URL)
- `/api/health` - Health check endpoint for service monitoring

**Development Setup**
- Vite middleware integration for HMR during development
- Static file serving for production builds
- Custom error overlay plugin for development (@replit/vite-plugin-runtime-error-modal)

### Data Storage Solutions

**Database Configuration**
- PostgreSQL as the primary database (Neon serverless driver)
- Drizzle ORM for type-safe database operations and schema management
- Schema definitions in shared directory for reuse between client and server

**Database Schema**
- Users table: ID (UUID), username (unique), password
- Videos table: ID (UUID), URL, title, creation timestamp
- Zod validation schemas generated from Drizzle schemas for runtime validation

**Session Storage**
- In-memory storage implementation (MemStorage class) for development
- Designed to be swappable with database-backed storage for production
- connect-pg-simple available for PostgreSQL session store integration

### External Dependencies

**Third-Party Video Service**
- JW Player: External video player library loaded via CDN
- Multiple CDN fallbacks configured for reliability
- Player library key: KB5zFt7A (configured in player initialization)

**UI Component Libraries**
- Radix UI: Comprehensive set of accessible, unstyled component primitives
- Lucide React: Icon library for consistent iconography
- Embla Carousel: Carousel/slider functionality
- cmdk: Command palette component
- date-fns: Date manipulation and formatting

**Development Tools**
- Replit-specific plugins: Cartographer (navigation), dev banner, runtime error modal
- Drizzle Kit: Database migration management and schema pushing
- esbuild: Server-side bundling for production builds
- tsx: TypeScript execution for development server

**Styling & Utilities**
- Tailwind CSS with PostCSS and Autoprefixer
- clsx + tailwind-merge (via cn utility) for conditional class merging
- Custom CSS variables for comprehensive theming support