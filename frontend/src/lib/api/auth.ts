import { apiFetch } from "@/lib/api/client";

export type UserRole = "candidate" | "admin";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  onboarding_completed: boolean;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  onboarding_completed: boolean;
};

export type UserProfile = {
  id: string;
  user_id: string;
  academic_stream: string | null;
  course: string | null;
  specialization: string | null;
  college: string | null;
  current_year: string | null;
  experience_level: string | null;
  target_role: string | null;
  career_goal: string | null;
  preferred_language: string;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicStream = {
  id: string;
  name: string;
  courses: string[];
  specializations: string[];
};

export type AcademicOptions = {
  streams: AcademicStream[];
  experience_levels: string[];
  target_roles: string[];
  languages: { code: string; label: string }[];
};

export const authApi = {
  signup: (body: { email: string; password: string; full_name: string }) =>
    apiFetch<TokenResponse>("/api/v1/auth/signup", {
      method: "POST",
      body,
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body,
    }),

  logout: () =>
    apiFetch<{ message: string; success: boolean }>("/api/v1/auth/logout", {
      method: "POST",
    }),

  me: () =>
    apiFetch<User>("/api/v1/auth/me", {
      cache: "no-store",
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string; success: boolean }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token: string, new_password: string) =>
    apiFetch<{ message: string; success: boolean }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: { token, new_password },
    }),

  getProfile: () =>
    apiFetch<UserProfile>("/api/v1/profile", {
      cache: "no-store",
    }),

  updateProfile: (data: Partial<UserProfile & { full_name?: string }>) =>
    apiFetch<UserProfile>("/api/v1/profile", {
      method: "PUT",
      body: data,
    }),

  completeOnboarding: (data: {
    full_name: string;
    academic_stream: string;
    course: string;
    specialization?: string;
    college?: string;
    current_year: string;
    experience_level: string;
    target_role: string;
    career_goal?: string;
    preferred_language: string;
  }) =>
    apiFetch<UserProfile>("/api/v1/profile/onboarding", {
      method: "POST",
      body: data,
    }),

  getAcademicOptions: () =>
    apiFetch<AcademicOptions>("/api/v1/profile/academic-options", {
      cache: "force-cache",
    }),
};
