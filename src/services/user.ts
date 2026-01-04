import handleAPI from "@/axios/handleAPI";
import { toNumber, toOptionalString, toString } from "@/services/shared";

export type UserProfile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type UserProfileUpdate = {
  firstName: string;
  lastName: string;
};

export type PasswordChange = {
  oldPassword: string;
  newPassword: string;
};

const normalizeProfile = (payload: any): UserProfile => ({
  id: toNumber(payload?.id ?? payload?.Id),
  email: toString(payload?.email ?? payload?.Email),
  firstName: toString(payload?.firstName ?? payload?.FirstName),
  lastName: toString(payload?.lastName ?? payload?.LastName),
  avatarUrl: toOptionalString(payload?.avatarUrl ?? payload?.AvatarUrl),
});

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await handleAPI("User/profile", undefined, "get");
  return normalizeProfile(response);
};

export const updateUserProfile = async (
  payload: UserProfileUpdate
): Promise<void> => {
  const request = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
  };
  await handleAPI("User/profile", request, "put");
};

export const changePassword = async (payload: PasswordChange): Promise<void> => {
  await handleAPI("User/change-password", payload, "put");
};

export const uploadAvatar = async (file: File): Promise<{
  avatarUrl: string;
  message?: string;
}> => {
  const data = new FormData();
  data.append("file", file);
  const response: any = await handleAPI("User/avatar", data, "post");
  return {
    avatarUrl: toString(response?.avatarUrl ?? response?.AvatarUrl),
    message: toString(response?.message ?? response?.Message),
  };
};

export const deleteAvatar = async (oldAvatarUrl: string): Promise<void> => {
  const encoded = encodeURIComponent(oldAvatarUrl);
  await handleAPI(`User/avatar?oldAvatarUrl=${encoded}`, undefined, "delete");
};

export const logout = async (): Promise<void> => {
  await handleAPI("Auth/logout", {}, "post");
};
