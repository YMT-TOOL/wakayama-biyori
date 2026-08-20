import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const arraySource=source.match(/const events = (\[[\s\S]*?\n\]);/)[1];
const events=vm.runInNewContext(arraySource);
const out=path.join(root,'events');
const baseUrl='https://ymt-tool.github.io/wakayama-biyori';
fs.mkdirSync(out,{recursive:true});
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=category=>({'子育て':'👪','マルシェ':'🧺','お祭り':'🏮','グルメ':'🍊','音楽・舞台':'🎵','文化・芸術':'🎨','スポーツ':'⚽','自然・アウトドア':'🌿','ワークショップ':'✂️','商業施設':'🛍️','施設イベント':'🎪','道の駅・市場':'🥬'}[category]||'📅');

for(const event of events){
  const title=`${event.title}｜わかやま日和`;
  const json=event.unconfirmed?'':`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Event',name:event.title,startDate:event.date,eventStatus:'https://schema.org/EventScheduled',location:{'@type':'Place',name:event.place,address:{'@type':'PostalAddress',addressLocality:event.city,addressRegion:'和歌山県',addressCountry:'JP'}},description:event.description,isAccessibleForFree:event.free})}</script>`;
  const pageUrl=`${baseUrl}/events/event-${event.id}.html`;
  const html=`<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(event.description)}"><link rel="canonical" href="${pageUrl}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(event.description)}"><meta property="og:url" content="${pageUrl}"><meta property="og:image" content="${baseUrl}/assets/instagram-profile-wakayama-biyori-v2.png"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="../styles.css">${json}</head><body><header class="site-header"><a class="brand" href="../index.html"><span class="brand-mark">わ</span><span><b>わかやま日和</b><small>WAKAYAMA EVENT GUIDE</small></span></a></header><main class="single-event"><div class="category-visual">${icon(event.category)}</div><article><div class="tags"><span class="tag city">${escape(event.city)}</span><span class="tag">${escape(event.category)}</span>${event.unconfirmed?'<span class="tag check">日時要確認</span>':''}</div><h1>${escape(event.title)}</h1><p>${escape(event.description)}</p><dl class="detail-grid"><dt>開催日</dt><dd>${escape(event.date)}</dd><dt>時間</dt><dd>${escape(event.time)}</dd><dt>会場</dt><dd>${escape(event.place)}</dd><dt>情報源</dt><dd><a href="${escape(event.sourceUrl)}" target="_blank" rel="noopener">${escape(event.source)} ↗</a></dd></dl><p class="source-note">内容が変更・中止になる場合があります。お出かけ前に公式情報をご確認ください。</p><div class="share-row"><a class="line-share" href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}">LINEで送る</a><a class="x-share" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}">Xで共有</a></div><a class="event-page-link" href="../index.html">← イベント一覧へ戻る</a></article></main></body></html>`;
  fs.writeFileSync(path.join(out,`event-${event.id}.html`),html);
}
console.log(`${events.length} event pages generated.`);
const urls=[`${baseUrl}/`,...events.map(event=>`${baseUrl}/events/event-${event.id}.html`)];
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
