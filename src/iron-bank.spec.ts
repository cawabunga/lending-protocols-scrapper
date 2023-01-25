import {Page, test} from '@playwright/test';
import {writeFileSync} from "node:fs";
import {ApyInfo} from "./types";

test('should navigate to the home page', async ({page}) => {
    await page.goto('https://app.ib.xyz/lending');

    const chains = [
        'Ethereum',
        'Avalanche',
        'Optimism',
        'Fantom',
    ];

    const list: ApyInfo[] = [];

    let prevChainName = '';
    for (const chainName of chains) {
        const switcher = page.getByRole('button', {name: chainName});
        if (!await switcher.isVisible()) {
            await page.getByRole('button', {name: prevChainName}).click();
            await page.getByRole('menuitem', {name: chainName}).click()
        }

        await page.waitForTimeout(3000);
        const apy = await extractAPY(page, (attrs) => ({...attrs, chainName: chainName, protocol: 'Iron Bank'}));
        list.push(...apy);
        prevChainName = chainName;
    }

    writeFileSync('./docs/files/iron-bank.json', JSON.stringify(list, null, '  '));
});

async function extractAPY(page: Page, infoFactory: (attrs: Pick<ApyInfo, 'tokenSymbol' | 'apy'>) => ApyInfo): Promise<ApyInfo[]> {
    const rows = page.getByText('Assets to Supply').locator('../following-sibling::div/div/div[position()>1]');

    const list: ApyInfo[] = []

    for (const row of await rows.all()) {
        const cols = row.locator('> div');
        const symbol = await cols.nth(0).textContent()
        const apyRaw = await cols.nth(1).textContent()

        const regexp = /\d*\.\d+|\d+\.?\d*/g // 0.1% or <0.01% or 0% or 1.1%4.5% or 0%1%
        const apy = Array.from(apyRaw?.match(regexp) ?? []).map(Number);

        list.push(infoFactory({tokenSymbol: symbol, apy: apy}));
    }

    return list;
}
