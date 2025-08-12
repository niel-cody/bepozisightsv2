# POS Intelligence System

An AI-powered Point of Sale (POS) analytics and intelligence platform that transforms raw sales data into actionable business insights through advanced analytics and intelligent reporting.

## Overview

This full-stack TypeScript application serves as a virtual manager assistant, allowing business owners and managers to query their POS data using natural language and receive actionable insights, trends, and recommendations for optimizing their operations.

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing  
- **TanStack Query** for server state management and caching
- **Shadcn/UI** components built on Radix UI primitives
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and optimized builds

### Backend Stack
- **Express.js** with TypeScript in ESM mode
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Express Session** with PostgreSQL session store
- **OpenAI GPT-4o** integration for AI insights

### Database Schema
- **Users**: Authentication and user management
- **Tills**: Cash register terminals with balance tracking
- **Operator Summaries**: Staff performance metrics and financial tracking
- **Till Summaries**: Daily business summaries with complete financial metrics
- **Products**: Inventory items with sales tracking
- **Transactions**: Complete transaction records with itemized details
- **Customer Summaries**: Customer account summaries with spending patterns
- **Chat Messages**: AI conversation history and context

## 🤖 AI Context System

The AI agent "Alex" uses a sophisticated modular context system to provide accurate business insights. This system consists of 7 specialized modules that compile into an optimized runtime configuration.

### Context Architecture

```
context/
├── context.base.json        # Core agent personality, communication style, responsibilities
├── context.data_model.json  # Database schema, table structures, column definitions
├── context.catalog.json     # Terms dictionary, business vocabulary, domain knowledge  
├── context.routing.json     # Query routing hints, function selection logic
├── context.templates.json   # Response templates, formatting patterns
├── context.thresholds.json  # Alert conditions, performance benchmarks
├── context.fewshot.json     # Example interactions, training patterns
└── compiled/
    └── alex_context.compiled.json  # Optimized runtime configuration
```

### Context Module Details

#### 1. Base Configuration (`context.base.json`)
**Purpose**: Defines Alex's core personality, communication style, and primary responsibilities.

**Key Sections**:
- **Agent Identity**: Name, role, purpose, personality traits
- **Communication Style**: Tone, language rules, speaker fusion patterns
- **Responsibilities**: Performance analysis, alert management, business insights
- **Response Contract**: Output format specifications and requirements
- **Formatting Rules**: Currency, percentage, and data display standards

**Example**:
```json
{
  "agent": {
    "name": "Alex",
    "role": "Virtual Manager & AI Assistant",
    "personality": "Friendly, calm, surgical with data; commercially minded"
  },
  "communicationStyle": {
    "tone": "Professional, warm, and concise—like a trusted consultant",
    "language": "Plain English. No unnecessary jargon"
  }
}
```

#### 2. Data Model (`context.data_model.json`)
**Purpose**: Complete database schema documentation with table structures and relationships.

**Key Sections**:
- **Tables**: Primary tables with column definitions and data types
- **Derived Metrics**: Calculated fields and business formulas
- **Relationships**: Foreign keys and table connections
- **Grain Definitions**: Data aggregation levels (venue+date, operator+date, etc.)

**Example**:
```json
{
  "tables": [
    {
      "name": "till_summaries",
      "grain": "venue + date", 
      "requiredColumns": ["Date", "Venue", "NettTotal", "Qty Transactions"]
    }
  ]
}
```

#### 3. Catalog (`context.catalog.json`)
**Purpose**: Business vocabulary and terminology dictionary for accurate data interpretation.

**Key Sections**:
- **Terms**: Business-specific vocabulary definitions
- **Synonyms**: Alternative ways users might refer to concepts
- **Units**: Currency, time, and measurement standards
- **Domain Knowledge**: Industry-specific rules and conventions

#### 4. Routing (`context.routing.json`) 
**Purpose**: Query analysis hints to help AI select appropriate functions and data sources.

**Key Sections**:
- **Intent Patterns**: Common query types and their handling
- **Function Selection**: Guidelines for choosing the right data function
- **Time Period Mapping**: How to interpret relative time references
- **Data Source Priorities**: Which tables to query for different question types

#### 5. Templates (`context.templates.json`)
**Purpose**: Standardized response patterns and formatting templates.

**Key Sections**:
- **Message Templates**: Common response structures
- **Insight Patterns**: How to present analytical findings
- **Recommendation Formats**: Action-oriented suggestion templates
- **Error Handling**: Graceful failure response patterns

#### 6. Thresholds (`context.thresholds.json`)
**Purpose**: Alert conditions and performance benchmarks for automated insights.

**Key Sections**:
- **Performance Alerts**: Revenue, transaction, and efficiency thresholds
- **Anomaly Detection**: Statistical boundaries for unusual patterns  
- **Comparison Baselines**: Period-over-period variance triggers
- **Risk Indicators**: Early warning system parameters

#### 7. Few-Shot Examples (`context.fewshot.json`)
**Purpose**: Training examples showing ideal AI behavior and response quality.

**Key Sections**:
- **Query-Response Pairs**: Sample interactions with expected outputs
- **Edge Cases**: How to handle unusual or complex requests
- **Data Integration**: Examples of combining multiple data sources
- **Business Context**: Domain-specific reasoning examples

### Context Compilation Process

The modular context files are merged into an optimized runtime configuration for production use.

#### Manual Compilation
```bash
# Run the compilation script
npx tsx scripts/compile-context.ts

# The compiled file is generated at:
# context/compiled/alex_context.compiled.json
```

#### Compilation Logic
1. **Base Loading**: Loads core configuration from `context.base.json`
2. **Module Merging**: Integrates each specialized module into the base structure
3. **Validation**: Ensures all required fields are present and properly formatted
4. **Optimization**: Removes development artifacts and optimizes for runtime performance
5. **Output Generation**: Creates the final compiled configuration with timestamp

#### Runtime Loading
The AI service automatically loads context in this priority order:

1. **Compiled Configuration**: `context/compiled/alex_context.compiled.json` (preferred)
2. **Modular Fallback**: Individual module files if compiled version unavailable
3. **Minimal Default**: Basic configuration if no context files found

```typescript
async function loadAgentConfig() {
  try {
    // Try compiled configuration first
    const compiledPath = 'context/compiled/alex_context.compiled.json';
    const config = JSON.parse(await fs.readFile(compiledPath, 'utf-8'));
    return config;
  } catch {
    // Fallback to modular loading
    const baseConfig = await loadModularContext();
    return baseConfig;
  }
}
```

### Context Development Workflow

#### 1. **Modifying Context**
- Edit individual module files in `context/` directory
- Never edit the compiled file directly
- Each module has a specific purpose and scope

#### 2. **Testing Changes**
- Restart the application to load new context
- Test AI responses to ensure proper behavior
- Verify function selection and data access

#### 3. **Production Deployment**
- Run compilation script before deployment
- Compiled file provides optimal runtime performance
- Version control both source modules and compiled output

### AI Function Integration

The context system works with AI function calling to provide data access:

#### Available Functions
- **getRevenueComparison**: Compare revenue across time periods
- **getBusinessSummary**: Overall business metrics and today's performance  
- **getTopPerformingStaff**: Top performing staff member information
- **getStaffDetails**: Detailed staff member information including refunds
- **getVenueSales**: Venue performance data and comparisons
- **getTopSpendingCustomers**: Customer spending analysis by time period
- **getCustomerDetails**: Detailed customer transaction history and patterns

#### Context-Function Integration
The context system guides the AI on:
- When to call specific functions based on query intent
- How to interpret and present function results
- What follow-up questions or insights to provide
- How to combine data from multiple functions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pos-intelligence-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Database connection
DATABASE_URL=your_neon_postgresql_url

# OpenAI integration  
OPENAI_API_KEY=your_openai_api_key

# PostgreSQL connection details (auto-configured with DATABASE_URL)
PGHOST=your_host
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database
```

4. **Initialize database schema**
```bash
npm run db:push
```

5. **Compile AI context (optional)**
```bash
npx tsx scripts/compile-context.ts
```

6. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database schema push
npm run db:push

# Context compilation
npx tsx scripts/compile-context.ts
```

## 📊 Features

### Core Functionality
- **AI Chat Interface**: Natural language business queries with "Alex"
- **Sales Analytics**: Revenue trends, comparisons, and performance metrics
- **Staff Performance**: Operator productivity and performance tracking
- **Product Reports**: Inventory and sales analysis by item/category
- **Customer Analytics**: Spending patterns and customer insights
- **Real-time Dashboards**: Live business metrics and KPI monitoring

### AI Capabilities
- **Natural Language Processing**: Ask questions in plain English
- **Contextual Analysis**: AI maintains conversation context and memory
- **Data Integration**: Combines data from multiple sources for comprehensive insights
- **Actionable Recommendations**: Specific, actionable business advice
- **Period Comparisons**: Automatic period-over-period analysis
- **Anomaly Detection**: Identifies unusual patterns and potential issues

### User Interface
- **Professional Design**: Clean, modern interface optimized for business use
- **Mobile Responsive**: Full functionality across all device sizes
- **Dark/Light Mode**: User preference theme switching
- **Accessible**: ARIA compliant with keyboard navigation support
- **Loading States**: Professional loading animations and skeleton screens

## 📈 Usage Examples

### Sample AI Queries
```
"How did we perform last week compared to the previous week?"
"Who are my top performing staff members this month?"
"Which customers spent the most in the past 30 days?"
"Show me revenue trends for the last quarter"
"What products are selling best this week?"
```

### Expected AI Responses
The AI provides:
- **Conversational answers** in plain English
- **Specific metrics** with exact numbers and comparisons
- **Business insights** explaining what the data means
- **Actionable recommendations** for operational improvements
- **Follow-up suggestions** for deeper analysis

## 🔧 Configuration

### Context Customization
Modify AI behavior by editing context modules:

1. **Personality**: Update `context.base.json` agent section
2. **Communication**: Adjust tone and language in communication style
3. **Data Access**: Add new tables/columns in `context.data_model.json`
4. **Terminology**: Update business vocabulary in `context.catalog.json`
5. **Alerts**: Configure thresholds in `context.thresholds.json`

### Database Configuration
The system uses Drizzle ORM with PostgreSQL:

- **Schema**: Defined in `shared/schema.ts`
- **Migrations**: Use `npm run db:push` for schema changes
- **Seeding**: Automatic sample data generation on first run

### API Integration
Add new data sources by:

1. **Extending Storage Interface**: Update `server/storage.ts`
2. **Adding Functions**: Create new AI functions in `server/services/agent.ts`
3. **Updating Context**: Document new functions in `context.tools.json`

## 📝 Contributing

### Development Guidelines
1. **Code Style**: TypeScript strict mode, ESLint configuration
2. **Testing**: Test AI responses after context changes
3. **Documentation**: Update README.md for architectural changes
4. **Context Changes**: Always recompile context after modifications

### File Organization
```
├── client/                 # React frontend application
├── server/                 # Express backend API
├── shared/                 # Shared types and schemas
├── context/                # AI context configuration modules
├── scripts/                # Build and utility scripts
├── migrations/             # Database migration files
└── docs/                   # Additional documentation
```

## 🐛 Troubleshooting

### Common Issues

**AI not responding correctly**
- Check context compilation: `npx tsx scripts/compile-context.ts`
- Verify OpenAI API key in environment variables
- Review function implementations in `server/services/agent.ts`

**Database connection errors**
- Verify DATABASE_URL environment variable
- Check PostgreSQL connection parameters
- Run `npm run db:push` to sync schema

**Context loading failures**
- Ensure all context module files are valid JSON
- Check for syntax errors in context files
- Verify compiled context file exists and is recent

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For technical support or feature requests, please create an issue in the repository or contact the development team.

---

**Last Updated**: August 12, 2025  
**System Version**: 2.0.0  
**Context Schema Version**: 2025-08-12