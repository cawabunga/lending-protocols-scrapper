import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";

const stables = [
  "USDT",
  "DAI",
  "USDC",
  "sUSD",
  "USDT.e",
  "USDC.e",
  "DAI.e",
  "FUSDT",
];

class AppRoot extends LitElement {
  static properties = {
    aprs: {},
    query: {},
    onlyStables: {},
  };

  constructor() {
    super();
    this.aprs = [];
    this.query = "";
    this.onlyStables = true;
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.aprs = [
      await loadAave(),
      await loadIronBank(),
      await loadFrancium(),
    ].flat();
  }

  render() {
    return html` <p>
        <label>
          Filter by token:
          <input
            type="text"
            placeholder="usd"
            .value="${this.query}"
            @input=${this._handleQueryChange}
          />
        </label>

        <label>
          <input
            type="checkbox"
            .checked="${this.onlyStables}"
            @click="${this._handleStableSwitch}"
          />
          Only Stablecoins
        </label>
      </p>

      <table>
        <thead>
          <th>Chain</th>
          <th>Protocol</th>
          <th>Symbol</th>
          <th>APY</th>
        </thead>
        <tbody>
          ${this.aprs
            .sort((a, b) => sum(b.apy) - sum(a.apy))
            .filter((apr) =>
              this.onlyStables ? stables.includes(apr.tokenSymbol) : true
            )
            .filter((apr) =>
              apr.tokenSymbol.toLowerCase().includes(this.query.toLowerCase())
            )
            .map(
              (apr) =>
                html`
                  <tr>
                    <td>${apr.chainName}</td>
                    <td>${apr.protocol}</td>
                    <td>${apr.tokenSymbol}</td>
                    <td
                      style="font-variant-numeric: tabular-nums; text-align: center;"
                    >
                      ${computeTotal(apr.apy)}
                    </td>
                  </tr>
                `
            )}
        </tbody>
      </table>`;
  }

  _handleQueryChange = (event) => {
    this.query = event.target.value;
  };

  _handleStableSwitch = (event) => {
    this.onlyStables = event.target.checked;
  };
}

customElements.define("app-root", AppRoot);

function computeTotal(apy) {
  const MULTIPLIER = 10000;
  const totalApy =
    apy.map((a) => a * MULTIPLIER).reduce((a, b) => a + b, 0) / MULTIPLIER;
  return `${totalApy}%`;
}

async function loadAave() {
  const response = await fetch("./files/aave.json");
  return response.json();
}

async function loadIronBank() {
  const response = await fetch("./files/iron-bank.json");
  return response.json();
}

async function loadFrancium() {
  const response = await fetch("./files/francium.json");
  return response.json();
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}
