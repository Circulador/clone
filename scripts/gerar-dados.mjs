// scripts/gerar-dados.mjs  (v3 — múltiplas estratégias + fallback do dataset embutido)
// Baixa a Planilha B do OneDrive e gera dados.json na raiz do repositório.
// Roda no servidor do GitHub Actions => sem CORS e sem login (se o link for público).
//
// Node 20+ (fetch nativo). Dependência única: xlsx.

import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SHEETS = [
  {
    id: 'B',
    nome: 'Planilha B — Balcão',
    url: 'https://1drv.ms/x/c/ba23482b38fbdc1e/EVyxoIPnz65Du-mLBAl7CuUBOsLybUkq3f-TJiOIyW9HBA?e=frZ3Ms',
    base: true,
  },
];

const OUT = 'dados.json';
const INDEX = 'index.html';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function p2(n) { return String(n).padStart(2, '0'); }
function isoFromCell(v) {
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${p2(v.getMonth() + 1)}-${p2(v.getDate())}`;
  if (typeof v === 'number' && v > 30000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5);
    return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
  }
  if (typeof v === 'string') {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) { let [, d, mo, y] = m; if (y.length === 2) y = '20' + y; return `${y}-${p2(+mo)}-${p2(+d)}`; }
  }
  return null;
}

const BAD = /^(MEDIA|MÉDIA|MENOR|MAIOR|TOTAL|ULTIMO|ÚLTIMO|ESTAMOS|DATA DE|NOME|RECEBIDO|GRUPO|N[ºo°]|B PLAN|PLANILHA|ATUALIZAD|DIAS)/i;

function rowsToRecords(rows, pid) {
  const recs = [];
  for (const r of rows) {
    if (!r || r.length < 2) continue;
    const entrega = isoFromCell(r[0]);
    const nome = typeof r[1] === 'string' ? r[1].trim() : '';
    if (!entrega || !nome || BAD.test(nome)) continue;
    const resol = isoFromCell(r[4]);
    recs.push({ entrega, nome: nome.replace(/\s+/g, ' '), grupo: r[2] != null ? String(r[2]).trim() || '-' : '-', resol: resol || null, planilha: pid, origem: pid });
  }
  return recs;
}

function b64url(s) { return Buffer.from(s, 'utf-8').toString('base64').replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-'); }

function decodeJsonUrl(raw) {
  return raw.replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '"');
}

function downloadUrls(shareUrl) {
  const enc = 'u!' + b64url(shareUrl);
  const withDl = shareUrl.includes('?') ? shareUrl + '&download=1' : shareUrl + '?download=1';
  return [
    { tag: 'api.shares/root/content', url: `https://api.onedrive.com/v1.0/shares/${enc}/root/content` },
    { tag: 'api.shares/driveItem/content', url: `https://api.onedrive.com/v1.0/shares/${enc}/driveItem/content` },
    { tag: '1drv.ms?download=1', url: withDl },
    { tag: 'share-page', url: shareUrl, html: true },
  ];
}

function looksLikeXlsx(buf) {
  return buf && buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4B;
}

async function fetchBuffer(url, tag) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA, Accept: '*/*' } });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) { console.log(`   ↳ [${tag}] HTTP ${res.status} (${ct})`); return null; }
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`   ↳ [${tag}] HTTP 200 · ${buf.length} bytes · ${ct}`);
  return buf;
}

function urlsFromShareHtml(html, finalUrl) {
  const found = [];
  for (const re of [
    /"(?:downloadUrl|@content\.downloadUrl)"\s*:\s*"([^"]+)"/g,
    /migratedDirectDownloadUrl\s*=\s*'([^']+)'/g,
  ]) {
    let m;
    while ((m = re.exec(html))) found.push(decodeJsonUrl(m[1]));
  }
  try {
    const u = new URL(finalUrl);
    const resid = u.searchParams.get('resid') || u.searchParams.get('id');
    const authkey = u.searchParams.get('authkey');
    if (resid && authkey) {
      found.push(`https://onedrive.live.com/download.aspx?resid=${encodeURIComponent(resid)}&authkey=${encodeURIComponent(authkey)}`);
    }
  } catch (_) { /* ignore */ }
  return [...new Set(found)];
}

async function tryDownload(sheet) {
  const attempts = downloadUrls(sheet.url);
  for (const a of attempts) {
    try {
      if (a.html) {
        const res = await fetch(a.url, { redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } });
        const html = await res.text();
        const extra = urlsFromShareHtml(html, res.url);
        for (const url of extra) {
          const buf = await fetchBuffer(url, `${a.tag}-parsed`);
          if (buf && looksLikeXlsx(buf)) {
            console.log(`   ↳ [${a.tag}-parsed] ✅ XLSX válido`);
            return buf;
          }
        }
        continue;
      }
      const buf = await fetchBuffer(a.url, a.tag);
      if (!buf) continue;
      if (looksLikeXlsx(buf)) { console.log(`   ↳ [${a.tag}] ✅ é um XLSX válido (assinatura PK)`); return buf; }
      const head = buf.slice(0, 120).toString('utf-8').replace(/\s+/g, ' ');
      console.log(`   ↳ [${a.tag}] ⚠️ não é XLSX. Início: "${head}"`);
    } catch (e) {
      console.log(`   ↳ [${a.tag}] ❌ ${e.message}`);
    }
  }
  return null;
}

function extractEmbeddedRecords() {
  try {
    const html = readFileSync(INDEX, 'utf-8');
    const m = html.match(/<script id="dataset"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return [];
    const records = JSON.parse(m[1]);
    console.log(`   ↳ dataset embutido: ${records.length} registros`);
    return records.map((r) => ({ ...r, planilha: r.planilha || 'B', origem: r.origem || 'B' }));
  } catch (e) {
    console.log(`   ↳ dataset embutido: ❌ ${e.message}`);
    return [];
  }
}

async function processSheet(sheet) {
  console.log(`\n📥 Baixando ${sheet.id} — ${sheet.nome}`);
  const buf = await tryDownload(sheet);
  if (!buf) { console.log(`   ⛔ Nenhuma estratégia trouxe um XLSX para ${sheet.id}.`); return []; }
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
  console.log(`   📗 Abas encontradas: ${wb.SheetNames.join(', ')}`);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
  console.log(`   📊 Linhas lidas na 1ª aba: ${rows.length}`);
  rows.slice(0, 3).forEach((r, i) => console.log(`      linha[${i}] = ${JSON.stringify((r || []).slice(0, 6))}`));
  const recs = rowsToRecords(rows, sheet.id);
  console.log(`   ✅ Registros válidos extraídos: ${recs.length}`);
  return recs;
}

async function main() {
  let base = [];
  let source = 'OneDrive (GitHub Actions)';
  const report = [];
  for (const s of SHEETS) {
    const recs = await processSheet(s);
    report.push(`${s.id}: ${recs.length} registros`);
    if (s.base) base = recs;
  }

  if (!base.length) {
    console.log('\n⚠️ OneDrive indisponível via API. Usando dataset embutido do index.html...');
    base = extractEmbeddedRecords();
    source = 'dataset embutido (fallback)';
  }

  console.log(`\n===== RESUMO =====\n${report.join('\n')}\nTotal final: ${base.length}`);

  if (!base.length) {
    console.error('\n⛔ Nenhum registro disponível. Abortando.');
    process.exit(1);
  }

  const payload = {
    meta: { generated_at: new Date().toISOString(), source, total: base.length },
    records: base,
  };
  mkdirSync(dirname(OUT) || '.', { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`\n💾 Gerado ${OUT} com ${base.length} registros (${source}).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
