function renderProductCard({ _id, name, avt, price, unit, discount, stock }) {
	const discountPrice = discount
		? (price * (100 - discount)) / 100
		: price;
	const safeStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
	const isOutOfStock = safeStock <= 0;
	const actionButton = isOutOfStock
		? '<button class="btn btn-accent disabled">Tạm hết hàng</button>'
		: `<button class="btn btn-outline-primary-accent add-cart" data-id="${_id}" data-price="${price}" data-stock="${safeStock}" data-discount="${discount}">
				Thêm giỏ hàng
			</button>`;

	return `<div class="col">
		  <div class="product-card">
			<a href="/san-pham/${_id}" class="product-top">
				<img class="product-avt" src="${avt}" alt="${name}" title="${name}">
			</a>
			<div class="product-content">
				<a class="product-name" href="/san-pham/${_id}" title="${name}">
					<h3 class="product-name">${name}</h3>
				</a>
				<div class="product-unit">ĐVT: ${unit}</div>
				<div class="product-price">
					<div class="vertical-center">
						<strong>${currencyFormat(discountPrice)}</strong>
							${
									discount
										? `<label class="discount-rate">-${discount}%</label>`
										: ''
								}
					</div>
					${
							discount
							? `<div class="discount">
											${currencyFormat(price)}
											</div>`
							: ''
						}
				</div>
			</div>
			<div class="product-bottom">${actionButton}</div>
		</div>
	  </div>`;
}

function renderProductList(products = []) {
	let staticUrl = '/public';
	try {
		staticUrl = STATIC_FILE_URL;
	} catch (error) {
		staticUrl = '/public';
	} finally {
		let xml = '';
		products.forEach(product => {
			xml += renderProductCard({
				...product,
				avt: `${staticUrl}/${product.avt}`,
			});
		});
		return xml;
	}
}
