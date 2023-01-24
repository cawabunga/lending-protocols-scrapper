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
					makeTd(aprItem.protocol),
					makeTd(aprItem.tokenSymbol),
					makeTd(aprItem.apy),
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

async function loadAave() {
	const response = await fetch('./files/aave.json');
	const items = await response.json();
	return items.map(item => ({...item, protocol: 'aave'}));
}

main();
