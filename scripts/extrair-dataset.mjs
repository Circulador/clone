import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf-8');
const m = html.match(/<script id="dataset"[^>]*>([\s\S]*?)<\/script>/);
if (!m) throw new Error('dataset não encontrado');
const records = JSON.parse(m[1]);
const payload = {
  meta: { generated_at: new Date().toISOString(), source: 'dataset embutido', total: records.length },
  records,
};
writeFileSync('dados.json', JSON.stringify(payload, null, 2), 'utf-8');
console.log(`dados.json gerado com ${records.length} registros`);
