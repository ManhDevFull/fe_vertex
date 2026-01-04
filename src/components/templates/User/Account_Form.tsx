"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import Panel from "@/components/ui/Panel";
import {
  changePassword,
  fetchUserProfile,
  type UserProfile,
  updateUserProfile,
} from "@/services/user";
import { updateAuthName } from "@/redux/reducers/authReducer";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_PROFILE: ProfileFormState = {
  firstName: "",
  lastName: "",
  email: "",
};

const EMPTY_PASSWORD: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
  disabled?: boolean;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  helper,
  disabled,
}: InputFieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      />
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

export default function AccountForm() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [passwordState, setPasswordState] = useState<PasswordFormState>(
    EMPTY_PASSWORD
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    const fullName = `${formState.firstName} ${formState.lastName}`.trim();
    return fullName.length > 0 ? fullName : "Customer";
  }, [formState.firstName, formState.lastName]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile();
      setProfile(data);
      setFormState({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
      });
    } catch (err: any) {
      console.error("Failed to load profile", err);
      setError(
        err?.response?.data?.message || "Unable to load profile details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSave = async () => {
    const nextFirstName = formState.firstName.trim();
    const nextLastName = formState.lastName.trim();

    if (!nextFirstName || !nextLastName) {
      toast.error("Please enter your first and last name.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        firstName: nextFirstName,
        lastName: nextLastName,
      });
      const updatedProfile = {
        ...(profile ?? { id: 0, email: formState.email, avatarUrl: null }),
        firstName: nextFirstName,
        lastName: nextLastName,
      };
      setProfile(updatedProfile);
      dispatch(
        updateAuthName({
          name: `${nextFirstName} ${nextLastName}`.trim(),
        })
      );
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(
        err?.response?.data?.message || "Failed to update profile details."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    if (profile) {
      setFormState({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
      });
    }
    setIsEditing(false);
  };

  const handlePasswordSave = async () => {
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      toast.error("Please complete all password fields.");
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({
        oldPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
      });
      toast.success("Password updated.");
      setPasswordState(EMPTY_PASSWORD);
      setIsPasswordOpen(false);
    } catch (err: any) {
      console.error("Failed to update password", err);
      toast.error(
        err?.response?.data?.message || "Could not update password."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordState(EMPTY_PASSWORD);
    setIsPasswordOpen(false);
  };

  return (
    <div className="space-y-6">
      <Panel
        title="Profile details"
        description="Update your name and account settings."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
              disabled={isSavingProfile}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isEditing
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isEditing ? "Save changes" : "Edit profile"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleProfileCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        }
      >
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading profile details...</div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="First name"
                name="firstName"
                value={formState.firstName}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, firstName: value }))
                }
                placeholder="Your first name"
                disabled={!isEditing}
              />
              <InputField
                label="Last name"
                name="lastName"
                value={formState.lastName}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, lastName: value }))
                }
                placeholder="Your last name"
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Display name"
                name="displayName"
                value={displayName}
                disabled
                helper="Visible to sellers and in order updates."
              />
              <InputField
                label="Email"
                name="email"
                value={formState.email}
                type="email"
                disabled
              />
            </div>
          </div>
        )}
      </Panel>

      <Panel
        title="Security"
        description="Change your password to keep your account safe."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                isPasswordOpen ? handlePasswordSave : () => setIsPasswordOpen(true)
              }
              disabled={isSavingPassword}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isPasswordOpen
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isPasswordOpen ? "Save password" : "Change password"}
            </button>
            {isPasswordOpen && (
              <button
                type="button"
                onClick={handlePasswordCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        }
      >
        {isPasswordOpen ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Current password"
              name="currentPassword"
              type="password"
              value={passwordState.currentPassword}
              onChange={(value) =>
                setPasswordState((prev) => ({
                  ...prev,
                  currentPassword: value,
                }))
              }
              placeholder="Enter current password"
            />
            <InputField
              label="New password"
              name="newPassword"
              type="password"
              value={passwordState.newPassword}
              onChange={(value) =>
                setPasswordState((prev) => ({ ...prev, newPassword: value }))
              }
              placeholder="Create a new password"
            />
            <InputField
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwordState.confirmPassword}
              onChange={(value) =>
                setPasswordState((prev) => ({
                  ...prev,
                  confirmPassword: value,
                }))
              }
              placeholder="Repeat new password"
            />
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Use a strong password with letters, numbers, and symbols.
          </div>
        )}
      </Panel>
    </div>
  );
}
