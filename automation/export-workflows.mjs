#!/usr/bin/env node
/**
 * export-workflows.mjs
 * Exports all workflows from n8n to JSON files in this folder.
 * Usage: N8N_API_KEY=<your-key> node automation/export-workflows.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.N8N_API_KEY;
const BASE = process.env.N8N_URL || 'http://localhost:5678';

if (!KEY) {
  console.error('ERROR: Set N8N_API_KEY environment variable');
  console.error('  $env:N8N_API_KEY="your-api-key"; node automation/export-workflows.mjs');
  process.exit(1);
}

const list = await fetch(`${BASE}/api/v1/workflows`, {
  headers: { 'X-N8N-API-KEY': KEY }
}).then(r => r.json());

if (!list.data) {
  console.error('Failed to fetch workflows:', JSON.stringify(list));
  process.exit(1);
}

for (const wf of list.data) {
  const detail = await fetch(`${BASE}/api/v1/workflows/${wf.id}`, {
    headers: { 'X-N8N-API-KEY': KEY }
  }).then(r => r.json());

  const slug = wf.name.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const outPath = join(__dir, slug + '.json');

  const exportObj = {
    name: detail.name,
    nodes: detail.nodes,
    connections: detail.connections,
    settings: detail.settings || {},
    active: detail.active
  };

  writeFileSync(outPath, JSON.stringify(exportObj, null, 2));
  console.log(`✅ Exported: ${slug}.json (${detail.nodes.length} nodes)`);
}

console.log('\nDone! Commit with: git add automation/ && git commit -m "chore: update n8n workflow backups"');
