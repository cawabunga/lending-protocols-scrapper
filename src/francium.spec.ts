import { Locator, Page, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { ApyInfo } from "./types";

test("francium", async ({ page }) => {
  await page.goto("https://francium.io/app/lend");

  const list: ApyInfo[] = [];

  const rows = page.locator(".ant-table-content .ant-table-tbody tr");
  await page.waitForTimeout(3000);

  for (const row of await rows.all()) {
    const apy = await extractAPY(row, (attrs) => ({
      ...attrs,
      chainName: "Solana",
      protocol: "Francium",
    }));

    list.push(apy);
  }

  writeFileSync("./docs/files/francium.json", JSON.stringify(list, null, "  "));
});

async function extractAPY(
  row: Locator,
  infoFactory: (attrs: Pick<ApyInfo, "tokenSymbol" | "apy">) => ApyInfo
): Promise<ApyInfo> {
  const cols = row.locator("td");
  const symbol = await row.getAttribute("data-row-key");
  const apyRaw = await cols.nth(1).textContent();

  const regexp = /\d*\.\d+|\d+\.?\d*/g; // 0.1% or <0.01% or 0% or 1.1%4.5% or 0%1%
  const apy = Array.from(apyRaw?.match(regexp) ?? []).map(Number);

  return infoFactory({ tokenSymbol: symbol, apy: apy });
}
