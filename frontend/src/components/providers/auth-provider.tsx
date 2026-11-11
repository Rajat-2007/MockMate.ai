"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type TokenResponse, type User, type UserProfile } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<TokenResponse>;
  signup: (fullName: string, email: string, password: string) => Promise<TokenResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile & { full_name?: string }>) => Promise<UserProfile>;
  completeOnboarding: (data: Parameters<typeof authApi.completeOnboarding>[0]) => Promise<UserProfile>;
  demoLogin: (role?: "student" | "tech" | "mba") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load stored token & user on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("mockmate_token");
    const savedUser = localStorage.getItem("mockmate_user");
    const savedProfile = localStorage.getItem("mockmate_profile");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore parsing error
        }
      }
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {
          // ignore parsing error
        }
      }
      // Re-fetch current user from API in background
      authApi
        .me()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          localStorage.setItem("mockmate_user", JSON.stringify(fetchedUser));
          return authApi.getProfile();
        })
        .then((fetchedProfile) => {
          setProfile(fetchedProfile);
          localStorage.setItem("mockmate_profile", JSON.stringify(fetchedProfile));
        })
        .catch(() => {
          // Keep offline/saved user if backend unavailable
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setToken(response.access_token);
      localStorage.setItem("mockmate_token", response.access_token);

      const userObj: User = {
        id: response.user_id,
        email: response.email,
        full_name: response.full_name,
        role: response.role,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        onboarding_completed: response.onboarding_completed,
      };
      setUser(userObj);
      localStorage.setItem("mockmate_user", JSON.stringify(userObj));

      // Fetch profile
      try {
        const prof = await authApi.getProfile();
        setProfile(prof);
        localStorage.setItem("mockmate_profile", JSON.stringify(prof));
      } catch {
        // profile might not exist yet
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signup({ full_name: fullName, email, password });
      setToken(response.access_token);
      localStorage.setItem("mockmate_token", response.access_token);

      const userObj: User = {
        id: response.user_id,
        email: response.email,
        full_name: response.full_name,
        role: response.role,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        onboarding_completed: false,
      };
      setUser(userObj);
      localStorage.setItem("mockmate_user", JSON.stringify(userObj));
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("mockmate_token");
    localStorage.removeItem("mockmate_user");
    localStorage.removeItem("mockmate_profile");
    setUser(null);
    setProfile(null);
    setToken(null);
    authApi.logout().catch(() => {});
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const [u, p] = await Promise.all([authApi.me(), authApi.getProfile()]);
      setUser(u);
      setProfile(p);
      localStorage.setItem("mockmate_user", JSON.stringify(u));
      localStorage.setItem("mockmate_profile", JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  const updateProfile = async (data: Partial<UserProfile & { full_name?: string }>) => {
    const updated = await authApi.updateProfile(data);
    setProfile(updated);
    localStorage.setItem("mockmate_profile", JSON.stringify(updated));
    if (data.full_name && user) {
      const updatedUser = { ...user, full_name: data.full_name };
      setUser(updatedUser);
      localStorage.setItem("mockmate_user", JSON.stringify(updatedUser));
    }
    return updated;
  };

  const completeOnboarding = async (data: Parameters<typeof authApi.completeOnboarding>[0]) => {
    const updated = await authApi.completeOnboarding(data);
    setProfile(updated);
    localStorage.setItem("mockmate_profile", JSON.stringify(updated));
    if (user) {
      const updatedUser = { ...user, onboarding_completed: true, full_name: data.full_name };
      setUser(updatedUser);
      localStorage.setItem("mockmate_user", JSON.stringify(updatedUser));
    }
    return updated;
  };

  const demoLogin = (role: "student" | "tech" | "mba" = "student") => {
    const demoConfigs = {
      student: {
        name: "Aman Sharma",
        email: "aman.student@mockmate.ai",
        course: "BCA",
        stream: "computer_applications",
        target: "Full Stack Developer",
        lang: "Hinglish (Hindi + English)",
      },
      tech: {
        name: "Rohan Verma",
        email: "rohan.tech@mockmate.ai",
        course: "B.Tech",
        stream: "engineering",
        target: "Software Engineer (SDE 1 / Fresher)",
        lang: "English",
      },
      mba: {
        name: "Pooja Gupta",
        email: "pooja.mba@mockmate.ai",
        course: "MBA",
        stream: "management",
        target: "Product Manager / Associate PM",
        lang: "English",
      },
    };

    const cfg = demoConfigs[role];
    const demoToken = `demo_token_${Date.now()}`;
    const demoUser: User = {
      id: "00000000-0000-0000-0000-000000000001",
      email: cfg.email,
      full_name: cfg.name,
      role: "candidate",
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      onboarding_completed: true,
    };

    const demoProfile: UserProfile = {
      id: "00000000-0000-0000-0000-000000000002",
      user_id: demoUser.id,
      academic_stream: cfg.stream,
      course: cfg.course,
      specialization: "Computer Applications & Software Systems",
      college: "Delhi University",
      current_year: "Final Year Student",
      experience_level: "Fresher / Recent Graduate",
      target_role: cfg.target,
      career_goal: "Crack upcoming campus placement interviews with high confidence",
      preferred_language: cfg.lang,
      bio: "Aspiring software professional preparing for upcoming placement drives.",
      phone: "+91 98765 43210",
      avatar_url: null,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setToken(demoToken);
    setUser(demoUser);
    setProfile(demoProfile);
    localStorage.setItem("mockmate_token", demoToken);
    localStorage.setItem("mockmate_user", JSON.stringify(demoUser));
    localStorage.setItem("mockmate_profile", JSON.stringify(demoProfile));
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
        refreshUser,
        updateProfile,
        completeOnboarding,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
