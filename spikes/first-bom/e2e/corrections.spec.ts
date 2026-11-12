// Lead's #14 correction review through the UI: B1 stale second tab is rejected visibly and loses nothing;
// B3 per-end physical attributes are shown in the compact review, editable from the edit shortcut, and
// drive grouping and staleness. Synthetic SYNTH-* values only (not vendor data, not qualification).
import { join } from 'node:path';
import { expect, test, ROOT } from './fixtures.ts';

const shots = join(ROOT, 'test-results', 'screens');
const generate = async (page: any, rev: number) => {
  await page.getByRole('tab', { name: 'BOM' }).click();
  await page.getByRole('button', { name: 'Generate' }).click();
  await expect(page.getByTestId('output-status')).toContainText(`input revision ${rev} · complete · current`);
};
const servers = (page: any) => page.getByTestId('pop-POP-A');

test('B1: a second tab with a stale view is refused with a visible message; the first edit survives', async ({ page, context, project }) => {
  const tab2 = await context.newPage();
  await page.goto(project.url); await tab2.goto(project.url);
  await expect(servers(tab2)).toContainText('2 physical server(s)');
  await servers(page).getByRole('button', { name: 'Add server' }).click();
  await expect(page.getByRole('status')).toContainText('Saved input revision');
  await expect(servers(page)).toContainText('3 physical server(s)');
  // tab 2 still shows revision 1 and edits from it
  await tab2.getByRole('button', { name: 'Replace dual-port DPU with two single-port DPUs' }).click();
  await expect(tab2.getByRole('alert')).toContainText('stale write');
  await expect(servers(tab2)).toContainText('3 physical server(s)'); // reloaded: shows tab 1's change
  await tab2.evaluate(() => window.scrollTo(0, 0)); await tab2.screenshot({ path: join(shots, 'b1-stale-tab.png'), fullPage: false });
  // retry from the reloaded view applies on top of tab 1's edit
  await tab2.getByRole('button', { name: 'Replace dual-port DPU with two single-port DPUs' }).click();
  await expect(tab2.getByRole('status')).toContainText('Saved input revision');
  await expect(tab2.getByText(/Input revision 3/)).toBeVisible();
  await expect(servers(tab2)).toContainText('3 physical server(s)');
  await tab2.close();
});

test('B3: per-end physical attributes in the compact review, edited via the shortcut, re-grouping and re-review', async ({ page, project }) => {
  await page.goto(project.url); await generate(page, 1);
  await page.getByRole('tab', { name: 'Connection review' }).click();
  const rows = page.getByTestId('review-rows').locator('tbody tr');
  const aRow = () => rows.filter({ hasText: 'frontend_dual_dpu_200' });
  for (const f of ['Cage', 'Connector', 'Optical PMD', 'Reach', 'Fiber']) { await expect(aRow().getByTestId('phys-A')).toContainText(`${f}: unknown`); await expect(aRow().getByTestId('phys-B')).toContainText(`${f}: unknown`); }
  await expect(rows.filter({ hasText: 'BE-SPLIT' }).first().getByTestId('phys-A')).toContainText('Host fit: unknown');
  // inspect the A frontend row while everything physical is unknown: those fields cannot be ticked
  await aRow().click();
  await expect(page.getByLabel('sideA.connector (unknown)')).toBeDisabled();
  await page.getByLabel('sideB.mode').check(); await page.getByLabel('review note').fill('A frontend mode checked');
  await page.getByRole('button', { name: 'Save inspection' }).click();
  await expect(aRow()).toContainText('retained within unchanged scope');
  // shortcut to the switch-end source fields
  await aRow().getByRole('button', { name: /edit side B physical/ }).click();
  const cons = page.getByTestId('cons-FE-OPT');
  await expect(cons).toHaveClass(/focus/);
  let rev = 1;
  const set = async (side: string, f: string, v: string) => { const i = page.getByLabel(`FE-OPT ${side} ${f}`, { exact: true }); await i.fill(v); await i.press('Enter'); rev++; await expect(page.getByText(new RegExp(`^Input revision ${rev} · `))).toBeVisible(); await expect(page.getByRole('alert')).toHaveCount(0); };
  await set('server', 'cage', 'SYNTH-CAGE-X'); await set('server', 'connector', 'SYNTH-CONN-1'); await set('server', 'pmd', 'SYNTH-PMD-P');
  await set('switch', 'cage', 'SYNTH-CAGE-Y'); await set('switch', 'connector', 'SYNTH-CONN-2'); await set('switch', 'pmd', 'SYNTH-PMD-P');
  await expect(page.getByRole('status')).toContainText('Affects 0 BOM line(s) and 2 review row(s)'); // physical-only edit: rows, not counts
  await cons.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(shots, 'b3-construction-ends.png'), fullPage: true });
  await generate(page, 7);
  const before = await page.getByTestId('bom').innerText();
  await page.getByRole('tab', { name: 'Connection review' }).click();
  await expect(aRow().getByTestId('phys-A')).toContainText('Connector: SYNTH-CONN-1');
  await expect(aRow().getByTestId('phys-B')).toContainText('Connector: SYNTH-CONN-2');
  await expect(aRow().getByTestId('phys-A')).toContainText('Cage: SYNTH-CAGE-X');
  await expect(aRow().getByTestId('phys-B')).toContainText('Cage: SYNTH-CAGE-Y');
  await expect(aRow().getByTestId('phys-B')).toContainText('Reach: unknown');
  await expect(aRow()).toContainText('not inspected'); // new signature; old inspection does not carry over
  await aRow().click();
  await expect(page.getByLabel('sideA.connector', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('sideB.reach (unknown)')).toBeDisabled();
  await page.getByLabel('sideA.connector', { exact: true }).check(); await page.getByLabel('sideB.connector', { exact: true }).check();
  await page.getByLabel('review note').fill('connectors inspected manually (synthetic)');
  await page.getByRole('button', { name: 'Save inspection' }).click();
  await expect(aRow()).toContainText('retained within unchanged scope');
  await page.screenshot({ path: join(shots, 'b3-connection-review.png'), fullPage: true });
  await page.getByRole('tab', { name: 'History & evidence' }).click();
  await expect(page.getByText(/A frontend mode checked|members moved|row signature changed/).first()).toBeVisible();
  const opts = await page.getByLabel('diff from').locator('option').allInnerTexts();
  await page.getByLabel('diff from').selectOption({ label: opts.find((t: string) => t.startsWith('r1'))! });
  await page.getByLabel('diff to').selectOption({ label: opts.find((t: string) => t.startsWith('r7'))! });
  await page.getByRole('button', { name: 'Diff' }).click();
  await expect(page.getByTestId('diff')).toContainText('sideB.connector unknown → SYNTH-CONN-2');
  await expect(page.getByTestId('diff')).not.toContainText('purchaseLines');
  await page.screenshot({ path: join(shots, 'b3-diff.png'), fullPage: true });
  await page.getByRole('tab', { name: 'BOM' }).click();
  expect(await page.getByTestId('bom').innerText()).toBe(before);
});
