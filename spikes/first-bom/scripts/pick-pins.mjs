// Pick the newest stable version of each package published at least MIN_AGE_DAYS ago (npm registry metadata).
const MIN_AGE_DAYS = 14;
const pkgs = process.argv.slice(2);
const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
const cutoff = Date.now() - MIN_AGE_DAYS * 86400e3;
for (const p of pkgs) {
  const r = await fetch(`https://registry.npmjs.org/${p.replace('/', '%2f')}`);
  const meta = await r.json();
  const ok = Object.entries(meta.time)
    .filter(([v, t]) => /^\d+\.\d+\.\d+$/.test(v) && Date.parse(t) <= cutoff && !meta.versions[v]?.deprecated)
    .sort((a, b) => cmp(a[0], b[0]));
  const [v, t] = ok.at(-1);
  console.log(JSON.stringify({ name: p, version: v, published: t.slice(0, 10), latest: meta['dist-tags'].latest }));
}
