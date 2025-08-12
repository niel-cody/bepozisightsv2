#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

interface ContextModule {
  name: string;
  path: string;
  content: any;
}

async function compileContext() {
  // Use the current working directory (project root)
  const contextDir = path.join(process.cwd(), 'context');
  const compiledDir = path.join(contextDir, 'compiled');
  const outputPath = path.join(compiledDir, 'alex_context.compiled.json');

  console.log('🔄 Compiling Alex context from modular files...');

  try {
    // Ensure compiled directory exists
    await fs.mkdir(compiledDir, { recursive: true });

    // Load all modular context files
    const modules: ContextModule[] = [];
    const moduleFiles = [
      'context.base.json',
      'context.data_model.json',
      'context.catalog.json', 
      'context.routing.json',
      'context.templates.json',
      'context.thresholds.json',
      'context.tools.json',
      'context.fewshot.json'
    ];

    for (const filename of moduleFiles) {
      const filePath = path.join(contextDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        modules.push({
          name: filename.replace('context.', '').replace('.json', ''),
          path: filePath,
          content: parsed
        });
        console.log(`✓ Loaded ${filename}`);
      } catch (error) {
        console.log(`⚠ Could not load ${filename}, skipping...`);
      }
    }

    // Merge all modules into a single compiled context
    let compiledContext: any = {
      schemaVersion: "2025-08-12",
      compiledAt: new Date().toISOString(),
      sourceModules: modules.map(m => m.name)
    };

    for (const module of modules) {
      // Merge module content into compiled context
      compiledContext = { ...compiledContext, ...module.content };
    }

    // Write compiled context to output file
    await fs.writeFile(outputPath, JSON.stringify(compiledContext, null, 2), 'utf-8');
    
    console.log('✅ Context compilation complete!');
    console.log(`📄 Compiled context saved to: ${outputPath}`);
    console.log(`🧩 Merged ${modules.length} modules`);
    console.log(`📊 Total size: ${JSON.stringify(compiledContext).length} characters`);
    
    return compiledContext;
  } catch (error) {
    console.error('❌ Context compilation failed:', error);
    process.exit(1);
  }
}

// Run compilation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compileContext();
}

export { compileContext };