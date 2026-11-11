// Checkpoint 2: create/customize two server classes, save, reopen in a fresh process, generate a useful
// conditional BOM, expand it without changing quantities.
import { join } from 'node:path';
import { expect, test, ROOT } from './fixtures.ts';

const shots = join(ROOT, 'test-results', 'screens');
const purchase = (page: any, item: string) => page.getByTestId(`line-${item}`).locator('td').nth(4);

test('customize, save, reopen in a fresh process, generate and expand the BOM', async ({ page, project }) => {
  await page.goto(project.url);
  await expect(page.getByTestId('class-A')).toBeVisible();
  await expect(page.getByTestId('class-B')).toBeVisible();
  // arbitrary per-unit item on class B
  const b = page.getByTestId('class-B');
  await b.getByLabel('new item key').fill('cable_management_arm');
  await b.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('status')).toContainText('Class B r1 → r1~rev2 (populations POP-B)');
  // DPU replacement and one more physical server in POP-A
  await page.getByRole('button', { name: 'Replace dual-port DPU with two single-port DPUs' }).click();
  await expect(page.getByRole('status')).toContainText('Saved input revision');
  await page.getByTestId('pop-POP-A').getByRole('button', { name: 'Add server' }).click();
  await expect(page.getByTestId('pop-POP-A')).toContainText('3 physical server(s) — A01, A02, A03');
  await page.screenshot({ path: join(shots, 'cp2-server-classes.png'), fullPage: true });
  // fresh server process: everything persisted
  const url = await project.restart(); await page.goto(url);
  await expect(page.getByText('Input revision 4')).toBeVisible();
  await expect(page.getByTestId('pop-POP-A')).toContainText('A01, A02, A03');
  // generate
  await page.getByRole('tab', { name: 'BOM' }).click();
  await page.getByRole('button', { name: 'Generate' }).click();
  await expect(page.getByTestId('output-status')).toContainText('input revision 4 · complete · current');
  await expect(purchase(page, 'frontend_single_dpu_200')).toHaveText('6');
  await expect(purchase(page, 'cable_management_arm')).toHaveText('2');
  await expect(purchase(page, 'accessory')).toContainText('unknown');
  await expect(purchase(page, 'accelerator')).toHaveText('0');
  for (const id of ['INF-LEAF', 'INF-SPINE', 'INF-UPLINK-MEDIA', 'INF-CONTROL-GATEWAY', 'INF-OOB', 'INF-ANCILLARY']) await expect(page.getByTestId(`missing-${id}`)).toContainText('unknown');
  const totals = () => page.getByTestId('bom').locator('tr[data-testid]').evaluateAll((rows: any[]) => rows.map(r => [...r.cells].slice(1).map((c: any) => c.innerText).join('|')));
  const before = await totals();
  await page.getByRole('button', { name: 'expand power_cord' }).click();
  await page.getByRole('button', { name: 'expand be_split_dac_2x400G' }).click();
  await expect(page.locator('tr.child').first()).toBeVisible();
  expect(await totals()).toEqual(before); // expansion never changes totals
  await page.screenshot({ path: join(shots, 'cp2-bom-expanded.png'), fullPage: true });
});
