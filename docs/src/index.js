function main() {
	const root = document.querySelector('#root');
	const app = document.createElement(AppComponent.tagName);
	root.appendChild(app);
}

export class AppComponent extends HTMLElement {
	static tagName = 'app-component';

	async connectedCallback() {
		this.render();

		const aprs = [await loadAave()].flat()
		this.renderAprs(aprs)
	}

	render() {
		this.innerHTML = `<table>
	<thead>
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

				const symbolCol = document.createElement('td');
				symbolCol.innerText = aprItem.tokenSymbol;

				const apyCol = document.createElement('td');
				apyCol.innerText = aprItem.apy;

				tr.append(symbolCol);
				tr.append(apyCol);

				return tr;
			})
			.forEach(tr => {
				table.appendChild(tr);
			});
	}
}

customElements.define(AppComponent.tagName, AppComponent);

async function loadAave() {
	const response = await fetch('./files/aave.json');
	const items = await response.json();
	return items.map(item => ({...item, protocol: 'aave'}));
}

main();
