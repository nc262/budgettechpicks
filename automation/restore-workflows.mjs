#!/usr/bin/env node
/**
 * restore-workflows.mjs
 * Imports all workflow JSON files in this folder into a running n8n instance.
 * Usage: N8N_API_KEY=<your-key> node automation/restore-workflows.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.N8N_API_KEY;
const BASE = process.env.N8N_URL || 'http://localhost:5678';

if (!KEY) {
  console.error('ERROR: Set N8N_API_KEY environment variable');
  console.error('  $env:N8N_API_KEY="your-api-key"; node automation/restore-workflows.mjs');
  process.exit(1);
}

const files = readdirSync(__dir).filter(f => f.endsWith('.json') && f !== 'README.md');

for (const file of files) {
  const workflow = JSON.parse(readFileSync(join(__dir, file), 'utf8'));
  console.log(`\nImporting: ${workflow.name}`);

  // Check if already exists
  const list = await fetch(`${BASE}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': KEY }
  }).then(r => r.json());

  const existing = list.data?.find(w => w.name === workflow.name);

  let result;
  if (existing) {
    console.log(`  Already exists (ID: ${existing.id}), updating...`);
    result = await fetch(`${BASE}/api/v1/workflows/${existing.id}`, {
      method: 'PUT',
      headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: workflow.name, nodes: workflow.nodes, connections: workflow.connections, settings: workflow.settings })
    }).then(r => r.json());
  } else {
    result = await fetch(`${BASE}/api/v1/workflows`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    }).then(r => r.json());
  }

  if (!result.id) {
    console.error(`  FAILED: ${JSON.stringify(result).substring(0, 200)}`);
    continue;
  }

  console.log(`  ✅ ID: ${result.id}`);

  // Activate if it was active
  if (workflow.active) {
    await fetch(`${BASE}/api/v1/workflows/${result.id}/activate`, {
      method: 'POST', headers: { 'X-N8N-API-KEY': KEY }
    });
    console.log(`  ⚡ Activated`);
  }
}

console.log('\nDone!');
