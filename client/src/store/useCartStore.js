import { create } from 'zustand';
import { API } from '../services/api';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartTotal: 0,
  cartTotalMoney: 0,
  loading: false,

  fetchCart: async (userId) => {
    if (!userId) {
      set({ cartItems: [], cartTotal: 0, cartTotalMoney: 0 });
      return;
    }
    set({ loading: true });
    try {
      const res = await API.cart.get(userId);
      const items = res?.data?.items || [];
      
      let total = 0;
      let totalMoney = 0;
      
      // Fetch prices for all items
      const enrichedItems = await Promise.all(items.map(async (item) => {
        try {
          const prodRes = await API.products.getBasicInfo(item.productId);
          const product = prodRes.data;
          const price = product?.price || 0;
          const discount = product?.discount || 0;
          const currentPrice = price * (100 - discount) / 100;
          
          total += item.quantity;
          totalMoney += currentPrice * item.quantity;
          
          return {
            ...item,
            productDetails: product,
            currentPrice
          };
        } catch (e) {
          return item;
        }
      }));

      set({ cartItems: enrichedItems, cartTotal: total, cartTotalMoney: totalMoney });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (userId, data) => {
    if (!userId) return false;
    try {
      await API.cart.add(userId, data);
      await get().fetchCart(userId);
      return true;
    } catch (e) {
      return false;
    }
  },

  updateQuantity: async (userId, productId, quantity) => {
    try {
      await API.cart.update(userId, { productId, quantity });
      await get().fetchCart(userId);
    } catch (e) {
      console.error(e);
    }
  },

  remove: async (userId, productId) => {
    try {
      await API.cart.remove(userId, productId);
      await get().fetchCart(userId);
    } catch (e) {
      console.error(e);
    }
  },

  clear: async (userId) => {
    try {
      await API.cart.clear(userId);
      await get().fetchCart(userId);
    } catch (e) {
      console.error(e);
    }
  }
}));
