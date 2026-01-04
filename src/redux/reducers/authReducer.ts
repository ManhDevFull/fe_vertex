"use client";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
export interface UserAuth {
  token?: string;
  name?: string;
  avata?: string;
  email?: string;
  role?: number;
  id?: number;
}
const userToken: UserAuth = {
  token: undefined,
  avata: undefined,
  name: undefined,
  email: undefined,
  role: undefined,
  id: undefined,
};
const authSlice = createSlice({
  name: "auth",
  initialState: {
    data: userToken,
  },
  reducers: {
    addAuth: (state, action: PayloadAction<UserAuth>) => {
      state.data = { ...userToken, ...action.payload };
      syncLocal(state.data);
    },
    removeAuth: (state) => {
      state.data = { ...userToken };
      syncLocal(userToken);
    },
    updateAuth: (state, action: PayloadAction<Pick<UserAuth, "token">>) => {
      state.data = { ...state.data, token: action.payload.token };
      syncLocal(state.data);
    },

    updateAuthName: (state, action) => {
      if (state.data) { // Kiểm tra data có tồn tại không
        state.data.name = action.payload.name; // Cập nhật chỉ trường name
        // Đồng bộ lại Local Storage với tên mới
        syncLocal({
          token: state.data.token,
          name: action.payload.name, // Dùng tên mới từ action payload
          avata: state.data.avata
        });
      }
    },
    updateAuthAvatar: (state, action) => {
      if (state.data) {
        state.data.avata = action.payload.avata; 
        syncLocal({
          token: state.data.token,
          name: state.data.name,
          avata: action.payload.avata // Dùng avatar mới
        });
      }
    },
  },
});
export const authReducer = authSlice.reducer;
export const { addAuth, updateAuth, removeAuth, updateAuthName, updateAuthAvatar } = authSlice.actions;
export const authSelector = (state: any) => state.authReducer.data;
const syncLocal = (data: UserAuth) => {
  if (typeof window === "undefined") return;
  if (data && data.token) {
    localStorage.setItem("token", JSON.stringify(data));
  } else {
    localStorage.removeItem("token");
  }
};
