import { Locator, Page, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { ApyInfo } from "./types";

test("pembrock", async ({ page }) => {
  await page.goto("https://app.pembrock.finance/lend");

  const list: ApyInfo[] = [];

  const rows = page.locator(".token_table");
  await page.waitForTimeout(3000);

  for (const row of await rows.all()) {
    const apy = await extractAPY(row, (attrs) => ({
      ...attrs,
      chainName: "Near",
      protocol: "Pembrock",
    }));

    list.push(apy);
  }

  writeFileSync("./docs/files/pembrock.json", JSON.stringify(list, null, "  "));
});

async function extractAPY(
  row: Locator,
  infoFactory: (attrs: Pick<ApyInfo, "tokenSymbol" | "apy">) => ApyInfo
): Promise<ApyInfo> {
  const symbol = await row.locator(".token_info__name").textContent();
  const apyRaw = await row
    .locator(".table > .column_wrapper")
    .nth(0)
    .locator(".column_value")
    .textContent();

  const regexp = /\d*\.\d+|\d+\.?\d*/g; // 0.1% or <0.01% or 0% or 1.1%4.5% or 0%1%
  const apy = Array.from(apyRaw?.match(regexp) ?? []).map(Number);

  return infoFactory({ tokenSymbol: symbol, apy: apy });
}
