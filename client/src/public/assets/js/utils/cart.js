function requireLogin() {
    if (!GLOBAL_USER_ID) {
        window.location.href = '/tai-khoan/dang-nhap';
        return true;
    }
    return false;
}

function currencyFormat(price = 0) {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
	}).format(price);
}

async function getCart() {
	if (!GLOBAL_USER_ID) return [];
	try {
		const res = await fetch(`${CART_SERVICE_API_URL}/user/${GLOBAL_USER_ID}`);
		const data = await res.json();
		return data?.items || [];
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function addToCart({ productId, quantity, shopId }) {
    if (requireLogin()) return;
	try {
		await fetch(`${CART_SERVICE_API_URL}/user/${GLOBAL_USER_ID}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity, shopId })
        });
	} catch (error) {
		console.error(error);
	}
}

async function loadCartSummary() {
	const cart = await getCart();
	if (cart && cart.length > 0) {
		const cartTotal = cart.reduce((sum, p) => sum + p.quantity, 0);
        
        const promises = cart.map(p => fetch(`${PRODUCT_SERVICE_API_URL}/id/${p.productId}`).then(r => r.json()));
        const productsInfo = await Promise.all(promises);
        
		let cartTotalMoney = 0;
        cart.forEach(cartItem => {
            const product = productsInfo.find(p => p._id === cartItem.productId);
            if (product) {
                cartTotalMoney += cartItem.quantity * ((product.price * (100 - (product.discount || 0))) / 100);
            }
        });

		$('span[id^="cartQuantity"]').text(`(${cartTotal})`);
		$('#cartMoney').text(currencyFormat(cartTotalMoney));
	} else {
		$('span[id^="cartQuantity"]').text('');
		$('#cartMoney').text('');
	}
}

async function removeAllCart() {
    if (!GLOBAL_USER_ID) return;
	try {
		await fetch(`${CART_SERVICE_API_URL}/user/${GLOBAL_USER_ID}/clear`, { method: 'DELETE' });
	} catch (error) {
		console.error(error);
	}
}

async function removeCartItem(productId) {
    if (!GLOBAL_USER_ID) return;
	try {
		await fetch(`${CART_SERVICE_API_URL}/user/${GLOBAL_USER_ID}/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
	} catch (error) {
		console.error(error);
	}
}

async function updateQuantityCart(productId, quantity) {
    if (!GLOBAL_USER_ID) return;
	try {
		await fetch(`${CART_SERVICE_API_URL}/user/${GLOBAL_USER_ID}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
	} catch (error) {
		console.error(error);
	}
}

jQuery(function () {
	if (GLOBAL_USER_ID) {
	    loadCartSummary();
    }

	$('.add-cart').on('click', async function () {
        if (requireLogin()) return;

		const productId = $(this).attr('data-id');
		const productStock = Number($(this).attr('data-stock'));
		// Need shopId here. If it is not in the data-shop attribute, we can fetch it.
        // Wait, 'addShopToProductList' in Order.php gets it via API: `/get-shop/:productId`
        // We can just fetch it before adding to cart.

		if (productId) {
            const shopRes = await fetch(`${PRODUCT_SERVICE_API_URL}/get-shop/${productId}`);
            const shopId = await shopRes.json();

			await addToCart({
				productId,
				quantity: 1,
				shopId
			});
			$(this).attr('data-stock', productStock - 1);
			if (productStock - 1 <= 0) {
				$(this)
					.parent('.product-bottom')
					.html(
						'<button class="btn btn-accent disabled">Tạm hết hàng</button>',
					);
			}
			await loadCartSummary();
			if (typeof showToast !== 'undefined') {
				showToast();
			}
		}
	});
});
