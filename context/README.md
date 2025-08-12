# AI Context Management

This folder contains modular context files for Alex, the virtual manager AI assistant.

## Structure

- **`base.json`** - Core agent configuration including personality, communication style, responsibilities, and response contracts
- **`data_model.json`** - Complete data schema definitions with column mappings, derived fields, and business rules
- **`../ai-agent-config.json`** - Legacy configuration file that references these modular sources

## Runtime Composition

At runtime, the system composes a single context by merging:
1. Base agent configuration (`base.json`)
2. Data model schema (`data_model.json`)  
3. Any additional context files as needed

## Benefits

- **Modularity**: Separate concerns (personality vs data schema)
- **Versioning**: Track changes to specific aspects independently
- **Maintainability**: Update data models without affecting core agent behavior
- **Reusability**: Share data models across multiple AI agents if needed

## Usage

The main application references these files via the `contextSources` field in `ai-agent-config.json`, enabling dynamic context composition while maintaining clean separation of concerns.