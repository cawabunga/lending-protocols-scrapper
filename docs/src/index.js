function main() {
	const root = document.querySelector('#root');
	const app = document.createElement(AppComponent.tagName);
	root.appendChild(app);
}

export class AppComponent extends HTMLElement {
	static tagName = 'app-component';

	async connectedCallback() {
		this.render();

		const aprs = [
			await loadAave(),
			await loadIronBank()
		].flat()

		this.renderAprs(aprs)
	}

	render() {
		this.innerHTML = `<table>
	<thead>
		<th>Chain</th>
		<th>Protocol</th>
		<th>Symbol</th>
		<th>APY</th>
	</thead>
	<tbody class="js-table-body"></tbody>
</table>`;
	}

	renderAprs(aprs) {
		const table = this.querySelector('.js-table-body');

		aprs
			.map((aprItem) => {
				const tr = document.createElement('tr');

				[
					makeTd(aprItem.chainName),
					makeTd(aprItem.protocol),
					makeTd(aprItem.tokenSymbol),
					makeApyTd(aprItem.apy),
				].forEach((node) => {
					tr.append(node)
				})

				return tr;
			})
			.forEach(tr => {
				table.appendChild(tr);
			});
	}
}

customElements.define(AppComponent.tagName, AppComponent);

function makeTd(textContent) {
	const td = document.createElement('td');
	td.innerText = textContent;
	return td
}

function makeApyTd(apy) {
	const MULTIPLIER = 10000
	const totalApy = apy.map((a) => a * MULTIPLIER).reduce((a, b) => a + b, 0) / MULTIPLIER;
	return makeTd(`${totalApy}%`)
}

async function loadAave() {
	const response = await fetch('./files/aave.json');
	return response.json();
}

async function loadIronBank() {
	const response = await fetch('./files/iron-bank.json');
	return response.json();
}

main();
