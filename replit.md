# POS Intelligence System

## Overview

This is a full-stack Point of Sale (POS) analytics and intelligence system that combines business data analysis with AI-powered insights. The application provides real-time monitoring of till operations, operator performance, product sales, and transaction data through an intelligent chat interface and comprehensive dashboard views.

The system serves as a virtual manager assistant, allowing business owners and managers to query their POS data using natural language and receive actionable insights, trends, and recommendations for optimizing their operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Custom component library built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Server**: Express.js with TypeScript running in ESM mode
- **API Design**: RESTful API with standardized endpoints for POS data operations
- **Development Server**: Hot module reloading with Vite middleware in development
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Logging**: Custom request/response logging for API endpoints

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Connection**: Neon serverless PostgreSQL for cloud database hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **In-Memory Storage**: Fallback memory storage implementation for development/testing

### Database Schema Design
The system models core POS entities:
- **Users**: Authentication and user management
- **Tills**: Cash register terminals with balance tracking
- **Operators**: Staff members with performance metrics
- **Products**: Inventory items with sales tracking
- **Transactions**: Complete transaction records with itemized details
- **Daily Summaries**: Aggregated daily business metrics
- **Chat Messages**: AI conversation history and context

### Authentication and Authorization
- Session-based authentication using express-session
- PostgreSQL session store with connect-pg-simple
- User management with secure password handling
- Session persistence across server restarts

### AI Integration
- **OpenAI Integration**: GPT-4o model for natural language processing and business insights
- **Context-Aware Analysis**: AI receives full POS context including tills, operators, products, and transaction history
- **Structured Responses**: AI returns both conversational responses and structured data for dashboard visualization
- **Business Intelligence**: AI acts as a virtual manager providing actionable recommendations and trend analysis

### Chart and Visualization
- **Charting Library**: Recharts for responsive, interactive data visualizations
- **Chart Types**: Line charts for trends, bar charts for comparisons, area charts for compact views
- **Real-time Updates**: Charts update automatically when underlying data changes
- **Responsive Design**: All visualizations adapt to different screen sizes

### Component Architecture
- **Design System**: Consistent component library following shadcn/ui patterns
- **Accessibility**: Full ARIA compliance through Radix UI primitives
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Reusable Components**: Modular UI components for metrics, alerts, charts, and data tables

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support across frontend and backend
- **Build Tools**: Vite for frontend bundling, ESBuild for backend compilation

### UI and Styling
- **Radix UI**: Complete set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Type-safe component variants

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema validation
- **Date-fns**: Date manipulation and formatting utilities

### Database and ORM
- **Drizzle ORM**: Type-safe database queries and schema management
- **Drizzle Kit**: Database migration and schema management tools
- **Neon Database**: Serverless PostgreSQL hosting
- **PostgreSQL**: Primary database system

### Backend Services
- **Express.js**: Web application framework
- **Express Session**: Session management middleware
- **Connect PG Simple**: PostgreSQL session store

### AI and External APIs
- **OpenAI**: GPT-4o model integration for business intelligence
- **Custom AI Service**: Wrapper around OpenAI API with POS-specific context handling

### Development and Build Tools
- **TSX**: TypeScript execution for development
- **Replit Plugins**: Development environment integration for Replit platform
- **PostCSS**: CSS processing with Autoprefixer
- **Recharts**: React charting library for data visualization

### Chart and Visualization
- **Recharts**: Responsive charting library built on D3
- **Embla Carousel**: Touch-friendly carousel component
- **Custom Chart Components**: Specialized charts for POS metrics and trends