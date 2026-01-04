import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  address: string;
  phone: string;
}

export interface PaymentMethod {
  id: string;
  providerId?: number;
  name: string;
  desc: string;
  img: string;
}

export interface ShippingMethod {
  id: string;
  optionId?: number;
  name: string;
  deliveryTime: string;
  shippingCost: string;
  insurance: string;
  img: string;
}

export interface CheckoutState {
  customerInfo: CustomerInfo;
  selectedPayment: string;
  selectedShipping: string;
  selectedAddressId: number | null;
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  checkoutItems: any[];
  checkoutSummary: any | null;
  selectedCartIds: number[];
}

const initialState: CheckoutState = {
  customerInfo: {
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    state: '',
    address: '',
    phone: '',
  },
  selectedPayment: '',
  selectedShipping: '',
  selectedAddressId: null,
  paymentMethods: [],
  shippingMethods: [],
  checkoutItems: [],
  checkoutSummary: null,
  selectedCartIds: [],
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    updateCustomerInfo: (state, action: PayloadAction<Partial<CustomerInfo>>) => {
      state.customerInfo = { ...state.customerInfo, ...action.payload };
    },
    setSelectedPayment: (state, action: PayloadAction<string>) => {
      state.selectedPayment = action.payload;
    },
    setSelectedShipping: (state, action: PayloadAction<string>) => {
      state.selectedShipping = action.payload;
    },
    setSelectedAddressId: (state, action: PayloadAction<number | null>) => {
      state.selectedAddressId = action.payload;
    },
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      state.paymentMethods = action.payload;
      if (state.paymentMethods.length > 0 && !state.selectedPayment) {
        state.selectedPayment = state.paymentMethods[0].id;
      }
    },
    setShippingMethods: (state, action: PayloadAction<ShippingMethod[]>) => {
      state.shippingMethods = action.payload;
      if (state.shippingMethods.length > 0 && !state.selectedShipping) {
        state.selectedShipping = state.shippingMethods[0].id;
      }
    },
    setCheckoutCart: (state, action: PayloadAction<{ items: any[]; summary: any; selectedIds?: number[] }>) => {
      state.checkoutItems = action.payload.items ?? [];
      state.checkoutSummary = action.payload.summary ?? null;
      const ids = action.payload.selectedIds ?? (action.payload.items ?? []).map((i: any) => i.cartId ?? i.id ?? 0);
      state.selectedCartIds = Array.isArray(ids) ? ids : [];
    },
    setSelectedCartIds: (state, action: PayloadAction<number[]>) => {
      state.selectedCartIds = action.payload;
    },
    clearCheckoutCart: (state) => {
      state.checkoutItems = [];
      state.checkoutSummary = null;
      state.selectedCartIds = [];
      state.selectedAddressId = null;
    }
  },
});

export const { 
  updateCustomerInfo, 
  setSelectedPayment, 
  setSelectedShipping, 
  setSelectedAddressId,
  setPaymentMethods, 
  setShippingMethods,
  setCheckoutCart,
  setSelectedCartIds,
  clearCheckoutCart
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
