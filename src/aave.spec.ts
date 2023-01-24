import {test} from '@playwright/test';
import {writeFileSync} from "node:fs";

test('should navigate to the home page', async ({page}) => {
    await page.goto('https://app.aave.com/markets/');

    const rows = page.locator('[data-cy*="marketListItemListItem_"]');

    await test.expect(rows.nth(0)).toBeVisible();


    const list: { tokenSymbol: string | null, apy: string | null }[] = []

    for (const row of await rows.all()) {
        const col1 = row.locator('> div >> nth=0');
        const col3 = row.locator('> div >> nth=2');

        const tokenSymbol = await col1.locator('> div').locator('> div').textContent();
        const apy = await col3.textContent();

        list.push({tokenSymbol: tokenSymbol, apy: apy});
    }

    writeFileSync('./files/aave.json', JSON.stringify(list, null, '  '));
});
