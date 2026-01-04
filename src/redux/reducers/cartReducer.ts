import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  img: string;
  color: string;
  price: number;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  giftBox: boolean;
  discount: number;
  giftBoxPrice: number;
}

const initialState: CartState = {
  items: [
    {
      id: 1,
      name: "2 Pieces Mango set- Regular fit",
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1757728058/9acc8538d56f8f0a9c230de5e9adeb0af8d8b151_vinljt.png",
      color: "#D3C453",
      price: 25.99,
      qty: 1,
    },
    {
      id: 2,
      name: "3 Pieces Mango set- Casual fit",
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1757728058/21b14b708643fa56d64ab49d595e02c6a614ea43_kpdacm.png",
      color: "#017EBA",
      price: 32.99,
      qty: 1,
    },
    {
      id: 3,
      name: "Zara Cardigan-Regular fit",
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1757728059/35134c01fee4a98483e0396acaa512d636a1942a_phetkk.png",
      color: "#7d3c3c",
      price: 40.25,
      qty: 1,
    }
  ],
  giftBox: true,
  discount: 47.10,
  giftBoxPrice: 10.90,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateQuantity: (state, action: PayloadAction<{ id: number; delta: number }>) => {
      const { id, delta } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.qty = Math.max(1, item.qty + delta);
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleGiftBox: (state) => {
      state.giftBox = !state.giftBox;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { updateQuantity, removeItem, toggleGiftBox, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
