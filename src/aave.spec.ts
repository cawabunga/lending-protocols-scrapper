import {Page, test} from '@playwright/test';
import {writeFileSync} from "node:fs";
import {ApyInfo} from "./types";

test('should navigate to the home page', async ({page}) => {
    await page.goto('https://app.aave.com/markets/');

    const chains = [
        ['marketSelector_proto_arbitrum_v3', 'Arbitrum'],
        ['marketSelector_proto_avalanche_v3', 'Avalanche'],
        ['marketSelector_proto_optimism_v3', 'Optimism'],
        ['marketSelector_proto_polygon_v3', 'Polygon'],
    ];

    const list: ApyInfo[] = [];

    for (const [option, chainName] of chains) {
        await page.locator('[data-cy="marketSelector"]').click()
        await page.locator('[data-cy="' + option + '"]').click()
        const apy = await extractAPY(page, (attrs) => ({...attrs, chainName: chainName, protocol: 'Aave'}));
        list.push(...apy);
    }

    writeFileSync('./docs/files/aave.json', JSON.stringify(list, null, '  '));
});

async function extractAPY(page: Page, infoFactory: (attrs: Pick<ApyInfo, 'tokenSymbol' | 'apy'>) => ApyInfo): Promise<ApyInfo[]> {
    const rows = page.locator('[data-cy*="marketListItemListItem_"]');

    await test.expect(rows.nth(0)).toBeVisible();

    const list: ApyInfo[] = []

    for (const row of await rows.all()) {
        const col1 = row.locator('> div >> nth=0');
        const col3 = row.locator('> div >> nth=2');

        const tokenSymbol = await col1.locator('> div').locator('> div').textContent();
        const apy = await col3.textContent();

        list.push(infoFactory({tokenSymbol: tokenSymbol, apy: apy}));
    }

    return list;
}
