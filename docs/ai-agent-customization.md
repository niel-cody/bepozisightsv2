# AI Agent Customization

## Overview
The POS Intelligence System includes a customizable AI agent that acts as a virtual manager. The agent's behavior and responses can be customized through the `ai-agent-config.json` file in the project root.

## How It Works
- The AI service automatically loads configuration from `ai-agent-config.json` on each request
- If the file is not found, the system falls back to default behavior
- Changes to the configuration file take effect immediately without requiring a restart
- JSON format allows for structured, typed configuration

## Customization Options

### Communication Style
Modify the tone, language complexity, and response format to match your business needs.

### Business Context
Add specific information about your venue type, products, staff roles, and operational procedures.

### Alert Thresholds
Define when the AI should flag issues like low cash balances, poor performance, or inventory concerns.

### Response Templates
Customize how the AI formats different types of responses (daily summaries, performance reports, alerts).

### Industry-Specific Knowledge
Add domain expertise relevant to your business type (restaurant, retail, etc.).

## Best Practices
1. **Be Specific**: Include exact numbers, thresholds, and business rules
2. **Use Examples**: Provide sample responses for common scenarios
3. **Regular Updates**: Review and update instructions as your business evolves
4. **Test Changes**: Ask the AI questions after updating to verify behavior

## Configuration Structure
The JSON configuration includes:
- `role` and `purpose`: Define the AI's core identity
- `businessContext`: Venue type, equipment, staff roles, product categories
- `communicationStyle`: Tone, language complexity, response requirements
- `responsibilities`: Performance analysis, alert management, business insights
- `responseTemplates`: Structured templates for common queries
- `alertThresholds`: Configurable warning levels for various metrics
- `dataInterpretation`: Guidelines for analyzing different types of business data
- `responseFormat`: Expected JSON structure for responses
- `keyPrinciples`: Core behavioral guidelines

## File Location
`/ai-agent-config.json` - Edit this JSON file to customize AI behavior