// Checkpoints 3–4 through the UI: grouped both-end review with edit shortcuts, scoped inspection,
// stale output after an edit, regenerate + diff, allocation-group exhaustion and controlled evidence refresh.
import { join } from 'node:path';
import { expect, test, ROOT } from './fixtures.ts';

const shots = join(ROOT, 'test-results', 'screens');
const generate = async (page: any, rev: number) => {
  await page.getByRole('tab', { name: 'BOM' }).click();
  await page.getByRole('button', { name: 'Generate' }).click();
  await expect(page.getByTestId('output-status')).toContainText(`input revision ${rev} · complete · current`);
};

test('review, edit shortcut, stale, regenerate, diff', async ({ page, project }) => {
  await page.goto(project.url); await generate(page, 1);
  await page.getByRole('tab', { name: 'Connection review' }).click();
  const rows = page.getByTestId('review-rows').locator('tbody tr');
  await expect(rows).toHaveCount(3);
  const bRow = rows.filter({ hasText: 'B@r1 · frontend_nic_200' });
  await expect(bRow).toContainText('LC-FE/FE-SERVER · 4x200G'); await expect(bRow.getByTestId('phys-A')).toContainText('Optical PMD: unknown'); await expect(bRow.getByTestId('phys-B')).toContainText('Connector: unknown');
  await bRow.click();
  await page.getByLabel('sideB.mode').check(); await page.getByLabel('review note').fill('B frontend both ends checked');
  await page.getByRole('button', { name: 'Save inspection' }).click();
  await expect(bRow).toContainText('retained within unchanged scope');
  await page.screenshot({ path: join(shots, 'cp3-connection-review.png'), fullPage: true });
  // edit shortcut lands on the source class slot
  await rows.filter({ hasText: 'A@r1 · frontend_dual_dpu_200' }).getByRole('button', { name: /edit side A source/ }).first().click();
  await expect(page.getByTestId('class-A')).toHaveClass(/focus/);
  // identity-preserving count edit -> output stale until regenerated
  await page.getByTestId('pop-POP-A').getByRole('button', { name: 'Add server' }).click();
  await expect(page.getByRole('status')).toContainText(/Affects \d+ BOM line\(s\) and \d+ review row\(s\)/);
  await page.getByRole('tab', { name: 'BOM' }).click();
  await expect(page.getByTestId('output-status')).toContainText('stale');
  await generate(page, 2);
  await page.getByRole('tab', { name: 'History & evidence' }).click();
  await expect(page.getByTestId('outputs')).toContainText('stale: input revision 1 is not the current head');
  const opts = await page.getByLabel('diff from').locator('option').allInnerTexts();
  await page.getByLabel('diff from').selectOption({ label: opts.find((t: string) => t.startsWith('r1'))! });
  await page.getByLabel('diff to').selectOption({ label: opts.find((t: string) => t.startsWith('r2'))! });
  await page.getByRole('button', { name: 'Diff' }).click();
  await expect(page.getByTestId('diff')).toContainText('regrouped');
  await expect(page.getByTestId('diff')).toContainText('BUY/be_split_dac_2x400G');
  await expect(page.getByText(/B frontend both ends checked|retained within unchanged scope/).first()).toBeVisible();
  await page.screenshot({ path: join(shots, 'cp4-history-diff.png'), fullPage: true });
});

test('allocation group exhaustion and controlled evidence refresh', async ({ page, project }) => {
  await page.goto(project.url);
  await page.getByRole('tab', { name: 'Destinations' }).click();
  await page.getByLabel('LC-FE selector').fill('1'); await page.getByTestId('ctx-LC-FE').getByRole('button', { name: 'Save selector' }).click();
  await expect(page.getByRole('status')).toContainText('Saved input revision');
  await page.getByLabel('LC-FE instance quantity').fill('1'); await page.getByLabel('LC-FE instance quantity').blur();
  await expect(page.getByText('Input revision 3')).toBeVisible();
  await generate(page, 3);
  await expect(page.getByTestId('diagnostics')).toContainText('capacity-exhausted');
  await page.getByRole('tab', { name: 'Destinations' }).click();
  await expect(page.getByTestId('bound-LC-FE')).toContainText('lower bound 2; 1 witness(es); unmet 4');
  await expect(page.getByTestId('configured-LC-FE')).toContainText('162 · within-budget');
  await page.screenshot({ path: join(shots, 'cp3-destinations-exhaust.png'), fullPage: true });
  await page.getByRole('tab', { name: 'History & evidence' }).click();
  await page.getByRole('button', { name: /Apply controlled revision ds5000-local-pipeline6/ }).click();
  await expect(page.getByRole('status')).toContainText('Historical outputs unchanged');
  await generate(page, 4);
  await expect(page.getByTestId('diagnostics')).toContainText('configured-budget-exceeded');
  await page.getByRole('tab', { name: 'History & evidence' }).click();
  await expect(page.getByTestId('outputs')).toContainText('evidence superseded');
  await expect(page.getByText('local-modified celestica-ds5000')).toBeVisible();
});
