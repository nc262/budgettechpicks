// One-time prune: drop insights whose source thread never actually mentions the product
// (same token rule the n8n pipeline now enforces at generation time).
import { readFileSync, writeFileSync } from 'fs';

const path = 'src/data/reddit-insights.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

function isRelevant(insight) {
  const text = [insight.sourcePost, insight.summary, ...(insight.pros || []), ...(insight.cons || []), ...(insight.key_insights || [])]
    .join(' ').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const words = (insight.product || '').replace(/[—–-]/g, ' ').split(/\s+/).filter(Boolean);
  const modelToks = [...new Set(words
    .filter(w => /\d/.test(w))
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length >= 3 && !/^\d+(pack|pk|th|nd|rd|st|gen|k)?$/.test(t)))];
  const nameWords = [...new Set(words
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length >= 3 && !/\d/.test(t) && !['the','and','for','with','best','pro','plus','wireless','gaming','true'].includes(t)))];
  // Accept shorthand forms owners actually type: "C920" for "C920s", "XM5" for "WF-1000XM5"
  const variants = modelToks.flatMap(t => {
    const suffix = (t.match(/[a-z]+\d+[a-z]*$/) || [])[0] || '';
    return [t, t.replace(/s$/, ''), suffix, suffix.replace(/s$/, '')];
  }).filter(v => v.length >= 3);
  return modelToks.length > 0
    ? variants.some(v => text.includes(v))
    : nameWords.filter(t => text.includes(t)).length >= 2;
}

let kept = 0, dropped = 0;
for (const slug of Object.keys(data)) {
  const before = data[slug].insights.length;
  data[slug].insights = data[slug].insights.filter(i => {
    const ok = isRelevant(i);
    if (!ok) console.log(`  drop [${slug}] ${i.product} — thread: "${(i.sourcePost || '').slice(0, 60)}"`);
    return ok;
  });
  kept += data[slug].insights.length;
  dropped += before - data[slug].insights.length;
  if (data[slug].insights.length === 0) delete data[slug];
}

writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`kept ${kept}, dropped ${dropped}`);
