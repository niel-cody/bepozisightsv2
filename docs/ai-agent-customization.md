# AI Agent Customization

## Overview
The POS Intelligence System includes a customizable AI agent that acts as a virtual manager. The agent's behavior and responses can be customized through the `ai-agent-instructions.md` file in the project root.

## How It Works
- The AI service automatically loads instructions from `ai-agent-instructions.md` on each request
- If the file is not found, the system falls back to default behavior
- Changes to the instructions file take effect immediately without requiring a restart

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

## File Location
`/ai-agent-instructions.md` - Edit this file to customize AI behavior