# POS Intelligence System

## Overview

This is a full-stack Point of Sale (POS) analytics and intelligence system that combines business data analysis with AI-powered insights. The application provides real-time monitoring of till operations, operator performance, product sales, and transaction data through an intelligent chat interface and comprehensive dashboard views.

The system serves as a virtual manager assistant, allowing business owners and managers to query their POS data using natural language and receive actionable insights, trends, and recommendations for optimizing their operations.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design: Clean, simple interface with minimal visual clutter for better focus.
Navigation: Always show navigation sidebar by default for quick access to features.

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
- **Database**: PostgreSQL as the primary database (now active and seeded)
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Connection**: Neon serverless PostgreSQL for cloud database hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Database Seeding**: Comprehensive sample data including 4 tills, 5 operators, 10 products, 7 days of summaries, and 25 transactions
- **Dual Storage**: Automatic fallback to in-memory storage if database unavailable

### Database Schema Design
The system models core POS entities:
- **Users**: Authentication and user management
- **Tills**: Cash register terminals with balance tracking
- **Operator Summaries**: Staff performance metrics and historical data with comprehensive financial tracking
- **Till Summaries**: Daily business summaries with complete financial metrics (renamed from Daily Summaries, venue field updated August 12, 2025)
- **Products**: Inventory items with sales tracking
- **Transactions**: Complete transaction records with itemized details
- **Customer Summaries**: Customer account transaction summaries with financial metrics, points, and visit tracking
- **Chat Messages**: AI conversation history and context

### Authentication and Authorization
- Session-based authentication using express-session
- PostgreSQL session store with connect-pg-simple
- User management with secure password handling
- Session persistence across server restarts

### UI/UX Design System (Updated: August 13, 2025)
- **Official Shadcn Sidebar**: Complete shadcn sidebar implementation following official documentation with SidebarProvider master container, proper offcanvas collapsible mode, and correct responsive behavior
- **Cross-Device Trigger**: Fixed SidebarTrigger to work on desktop, tablet, and mobile with proper offcanvas behavior that shows/hides sidebar appropriately per device
- **Sidebar Architecture**: Proper shadcn layout structure with SidebarInset container and correct responsive patterns following official documentation
- **Professional Header**: Official shadcn dropdown menu pattern for workspace selection with multiple organization options
- **Professional Footer**: Official shadcn dropdown menu pattern for user account actions (Account, Settings, Sign out) following SidebarMenu structure
- **Mobile Safari Viewport Fixes**: Comprehensive mobile viewport handling with dvh units and Safari-specific CSS fixes to prevent header cutoff issues
- **Navigation Improvements**: Chat history now closed by default for cleaner sidebar interface, "Operators" section renamed to "Staff Performance" for better clarity
- **Professional Interface**: Complete UI/UX overhaul with modern design patterns
- **High Contrast Theme**: Improved color scheme with 98% white text for maximum readability
- **Interactive Elements**: Enhanced hover states, focus rings, and micro-interactions
- **Loading States**: Professional loading animations and skeleton screens
- **Error Handling**: Comprehensive error states with actionable messaging
- **Responsive Design**: Mobile-first approach with adaptive layouts across all screen sizes
- **Accessibility**: Full ARIA compliance and keyboard navigation support
- **Visual Hierarchy**: Clear typography scale and spacing system for improved readability

### AI Integration
- **OpenAI Integration**: GPT-4o model for natural language processing and business insights
- **Context-Aware Analysis**: AI receives real-time POS data from PostgreSQL database including tills, operators, products, transaction history, and customer spending data
- **Structured Responses**: AI returns both conversational responses and structured data for dashboard visualization
- **Business Intelligence**: AI acts as a virtual manager providing actionable recommendations and trend analysis
- **Real Data Analysis**: AI now analyzes authentic POS data from the database for accurate insights
- **Customer Analytics**: AI can analyze customer spending patterns, identify top customers, and provide customer-specific insights from customer_summaries table (Updated: August 12, 2025)
- **Comprehensive Modular Context System**: 7-module context architecture with base configuration, data models, term dictionary, routing hints, response templates, alerting thresholds, and few-shot examples (Updated: August 12, 2025)
- **Compiled Context Runtime**: Modular context files automatically merge into optimized compiled configuration for production use
- **Context Compilation Script**: Automated build process merges individual modules without editing compiled files directly
- **Named AI Assistant**: Meet "Alex" - the virtual manager with enhanced personality, sophisticated reasoning patterns, and consistent identity
- **Complete Documentation**: Comprehensive README.md with full context system guide, usage examples, and development workflow (Updated: August 12, 2025)
- **Realistic Staff Data**: Fixed Brendan Catering system entries with realistic staff member data using proper transaction patterns and sales figures (Updated: August 12, 2025)

### Chart and Visualization
- **Charting Library**: Recharts for responsive, interactive data visualizations
- **Chart Types**: Line charts for trends, bar charts for comparisons, area charts for compact views
- **Real-time Updates**: Charts update automatically when underlying data changes
- **Responsive Design**: All visualizations adapt to different screen sizes

### Component Architecture
- **Official Shadcn Components**: Implemented official shadcn sidebar and navigation components
- **Design System**: Consistent component library following shadcn/ui patterns with professional styling
- **Accessibility**: Full ARIA compliance through Radix UI primitives
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Reusable Components**: Modular UI components for metrics, alerts, charts, and data tables
- **Enhanced Header**: Professional header with context indicators and user status
- **Improved Chat Interface**: Redesigned chat with better message bubbles and loading states
- **File Upload Enhancement**: Drag-and-drop CSV upload with visual feedback and error handling

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