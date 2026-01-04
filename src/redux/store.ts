'use client'
import {configureStore} from "@reduxjs/toolkit"
import { authReducer } from "./reducers/authReducer"
import cartReducer from "./reducers/cartReducer"
import checkoutReducer from "./reducers/checkoutReducer"

const store = configureStore({
  reducer:{
      authReducer,
      cart: cartReducer,
      checkout: checkoutReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store