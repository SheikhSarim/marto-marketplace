import { create } from 'zustand';
import { User, UserProfile, UserRole } from '@/types';
import {
  apiClient,
  setApiAccessToken,
  getApiAccessToken,
  refreshAccessToken,
  ApiError,
} from '@/lib/api-client';
import { authService } from '@/services/auth.service';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CustomerRegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

const ROLE_COOKIE_NAME = 'marto_session_role';

function syncRoleCookie(role: UserRole | null): void {
  if (typeof document === 'undefined') return;
  if (!role || role === 'GUEST') {
    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } else {
    document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function extractToken(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const data = (r.data as Record<string, unknown> | undefined) ?? undefined;
  const token =
    (typeof r.accessToken === 'string' && r.accessToken) ||
    (typeof data?.accessToken === 'string' && data.accessToken) ||
    (typeof r.token === 'string' && r.token) ||
    (typeof data?.token === 'string' && data.token) ||
    null;
  return token;
}

export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const data = (r.data as Record<string, unknown> | undefined) ?? undefined;

  if (r.isAuthenticated === false || data?.isAuthenticated === false) {
    return null;
  }

  const candidate = (r.user || data?.user || r.data || r) as Record<string, unknown>;
  if (!candidate || typeof candidate !== 'object') return null;
  if (!candidate.email && !candidate.id) return null;

  const rawRole = String(candidate.role || '').toUpperCase();
  const role: UserRole =
    rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN'
      ? 'SUPER_ADMIN'
      : rawRole === 'SELLER'
      ? 'SELLER'
      : 'CUSTOMER';

  const email = typeof candidate.email === 'string' ? candidate.email : '';
  const name =
    (typeof candidate.name === 'string' && candidate.name) ||
    (typeof candidate.fullName === 'string' && candidate.fullName) ||
    (typeof candidate.full_name === 'string' && candidate.full_name) ||
    (typeof candidate.username === 'string' && candidate.username) ||
    (email ? email.split('@')[0] : 'Marto User');

  return {
    id: String(candidate.id || candidate._id || ''),
    name,
    email,
    role,
    status: typeof candidate.status === 'string' ? candidate.status : undefined,
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    avatarUrl:
      (typeof candidate.profile_pic === 'string' && candidate.profile_pic) ||
      (typeof candidate.avatarUrl === 'string' && candidate.avatarUrl) ||
      (typeof candidate.avatar === 'string' && candidate.avatar) ||
      undefined,
    emailVerified: Boolean(
      candidate.is_email_verified ?? candidate.emailVerified ?? candidate.email_verified ?? true
    ),
    createdAt:
      typeof candidate.createdAt === 'string'
        ? candidate.createdAt
        : typeof candidate.created_at === 'string'
        ? candidate.created_at
        : new Date().toISOString(),
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : typeof candidate.updated_at === 'string'
        ? candidate.updated_at
        : undefined,
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  serverConnected: boolean | null;

  checkSession: (force?: boolean) => Promise<User | null>;
  adminLogin: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  sellerLogin: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
    isUnverified?: boolean;
    isPending?: boolean;
    isRejected?: boolean;
  }>;
  sellerRegister: (
    formData: FormData
  ) => Promise<{ success: boolean; message?: string; data?: unknown }>;
  checkSellerStatus: (
    email: string
  ) => Promise<{ success: boolean; message?: string; data?: unknown }>;
  verifyEmail: (
    token: string
  ) => Promise<{ success: boolean; message?: string; data?: unknown }>;
  customerLogin: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
    isUnverified?: boolean;
  }>;
  customerRegister: (
    data: CustomerRegisterData
  ) => Promise<{ success: boolean; message?: string; data?: unknown }>;
  resendCustomerVerification: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  forgotCustomerPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  resetCustomerPassword: (data: {
    token: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string; statusCode?: number }>;
  verifyEmailChange: (
    token: string
  ) => Promise<{ success: boolean; statusCode?: number; message?: string; data?: unknown }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  pingServer: () => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  syncProfileToUser: (profile: Partial<UserProfile>) => void;
}

let inFlightSessionCheck: Promise<User | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isCheckingSession: true,
  hasCheckedSession: false,
  error: null,
  serverConnected: null,

  pingServer: async () => {
    try {
      await apiClient.get(ENDPOINTS.HEALTH.path, { skipAuth: true, skipRefreshRetry: true });
      set({ serverConnected: true });
      return true;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 0) {
        set({ serverConnected: false });
        return false;
      }
      set({ serverConnected: true });
      return true;
    }
  },

  checkSession: async (force = false) => {
    if (inFlightSessionCheck) {
      return inFlightSessionCheck;
    }

    if (get().hasCheckedSession && !force) {
      return get().user;
    }

    set({ isCheckingSession: true, error: null });

    inFlightSessionCheck = (async () => {
      try {
        const response = await authService.checkSession();
        const user = normalizeUser(response);
        const token = extractToken(response) || getApiAccessToken();

        if (token) {
          setApiAccessToken(token);
        }

        if (user) {
          syncRoleCookie(user.role);
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
            isCheckingSession: false,
            hasCheckedSession: true,
            serverConnected: true,
            error: null,
          });
          return user;
        }

        syncRoleCookie(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isCheckingSession: false,
          hasCheckedSession: true,
          serverConnected: true,
        });
        return null;
      } catch (err: unknown) {
        const isOffline = err instanceof ApiError && err.statusCode === 0;
        syncRoleCookie(null);
        setApiAccessToken(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isCheckingSession: false,
          hasCheckedSession: true,
          serverConnected: isOffline ? false : true,
        });
        return null;
      } finally {
        inFlightSessionCheck = null;
      }
    })();

    return inFlightSessionCheck;
  },

  adminLogin: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = (await authService.loginAdmin(credentials)) as Record<string, unknown>;
      const token = extractToken(response);
      if (token) setApiAccessToken(token);

      const user = normalizeUser(response);
      if (!user) {
        throw new Error('Server returned an empty or invalid user profile.');
      }
      if (user.role !== 'SUPER_ADMIN') {
        setApiAccessToken(null);
        throw new Error('Access denied: Account does not possess Super Admin privileges.');
      }

      syncRoleCookie('SUPER_ADMIN');
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        hasCheckedSession: true,
        isCheckingSession: false,
        isLoading: false,
        error: null,
        serverConnected: true,
      });

      return {
        success: true,
        user,
        message: typeof response?.message === 'string' ? response.message : 'Admin authentication successful.',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Admin login failed.';
      const isOffline = err instanceof ApiError && err.statusCode === 0;
      set({
        isLoading: false,
        error: errorMsg,
        serverConnected: isOffline ? false : true,
      });
      return { success: false, message: errorMsg };
    }
  },

  sellerLogin: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = (await authService.loginSeller(credentials)) as Record<string, unknown>;
      const token = extractToken(response);
      if (token) setApiAccessToken(token);

      const user = normalizeUser(response);
      if (!user) {
        throw new Error('Server returned an empty or invalid seller profile.');
      }
      if (user.role !== 'SUPER_ADMIN') {
        user.role = 'SELLER';
      }

      syncRoleCookie(user.role);
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        hasCheckedSession: true,
        isCheckingSession: false,
        isLoading: false,
        error: null,
        serverConnected: true,
      });

      return {
        success: true,
        user,
        message: typeof response?.message === 'string' ? response.message : 'Seller authentication successful.',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Seller login failed.';
      const isOffline = err instanceof ApiError && err.statusCode === 0;
      const lower = errorMsg.toLowerCase();
      set({
        isLoading: false,
        error: errorMsg,
        serverConnected: isOffline ? false : true,
      });
      return {
        success: false,
        message: errorMsg,
        isUnverified: lower.includes('verify') || lower.includes('verification'),
        isPending:
          lower.includes('pending') ||
          lower.includes('approval') ||
          lower.includes('under review'),
        isRejected: lower.includes('reject'),
      };
    }
  },

  sellerRegister: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = (await authService.registerSeller(formData)) as Record<string, unknown>;
      set({ isLoading: false, error: null, serverConnected: true });
      return {
        success: true,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'Seller application submitted. Please verify your email address.',
        data: response?.data ?? response,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Seller registration failed.';
      const isOffline = err instanceof ApiError && err.statusCode === 0;
      set({
        isLoading: false,
        error: errorMsg,
        serverConnected: isOffline ? false : true,
      });
      return { success: false, message: errorMsg };
    }
  },

  checkSellerStatus: async (email) => {
    try {
      const response = (await apiClient.post(
        ENDPOINTS.SELLER_APPLICATION_STATUS.path,
        { email: email.trim() },
        { skipAuth: true, skipRefreshRetry: true }
      )) as Record<string, unknown>;
      return {
        success: true,
        data: response?.data ?? response,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'If this email exists in our records, we have sent an application update.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unable to check application status.',
      };
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = (await authService.verifyEmail(token)) as Record<string, unknown>;
      return {
        success: true,
        data: response?.data ?? response,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'Email verified successfully! You can now sign in.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message:
          err instanceof Error ? err.message : 'Email verification failed or token is expired.',
      };
    }
  },

  customerLogin: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = (await authService.loginCustomer(credentials)) as Record<string, unknown>;
      const token = extractToken(response);
      if (token) setApiAccessToken(token);

      const user = normalizeUser(response);
      if (!user) {
        throw new Error('Server returned an empty or invalid customer profile.');
      }

      syncRoleCookie(user.role);
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        hasCheckedSession: true,
        isCheckingSession: false,
        isLoading: false,
        error: null,
        serverConnected: true,
      });

      return {
        success: true,
        user,
        message: typeof response?.message === 'string' ? response.message : 'Signed in successfully.',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed.';
      const isOffline = err instanceof ApiError && err.statusCode === 0;
      const statusCode = err instanceof ApiError ? err.statusCode : 400;
      const lower = errorMsg.toLowerCase();

      set({
        isLoading: false,
        error: errorMsg,
        serverConnected: isOffline ? false : true,
      });

      return {
        success: false,
        message: errorMsg,
        isUnverified:
          statusCode === 401 && (lower.includes('verify') || lower.includes('verification')),
      };
    }
  },

  customerRegister: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = (await authService.registerCustomer(data)) as Record<string, unknown>;
      set({ isLoading: false, error: null, serverConnected: true });
      return {
        success: true,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'Customer registration successful! Check your email to verify your account.',
        data: response?.data ?? response,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed.';
      const isOffline = err instanceof ApiError && err.statusCode === 0;
      set({
        isLoading: false,
        error: errorMsg,
        serverConnected: isOffline ? false : true,
      });
      return { success: false, message: errorMsg };
    }
  },

  resendCustomerVerification: async (email) => {
    try {
      const response = (await authService.resendCustomerVerification({ email })) as Record<
        string,
        unknown
      >;
      return {
        success: true,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'Verification link sent! Please check your inbox.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message:
          err instanceof Error ? err.message : 'Failed to resend verification link.',
      };
    }
  },

  forgotCustomerPassword: async (email) => {
    try {
      const response = (await authService.forgotCustomerPassword({ email })) as Record<
        string,
        unknown
      >;
      return {
        success: true,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'If this email is registered, a password reset link has been sent.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message:
          err instanceof Error ? err.message : 'Failed to send password reset email.',
      };
    }
  },

  resetCustomerPassword: async (data) => {
    try {
      const response = (await authService.resetCustomerPassword(data)) as Record<
        string,
        unknown
      >;
      return {
        success: true,
        statusCode: 200,
        message:
          typeof response?.message === 'string'
            ? response.message
            : 'Customer password reset successfully.',
      };
    } catch (err: unknown) {
      const statusCode = err instanceof ApiError ? err.statusCode : 400;
      return {
        success: false,
        statusCode,
        message:
          err instanceof Error
            ? err.message
            : 'Invalid or expired password reset token.',
      };
    }
  },

  refreshSession: async () => {
    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        syncRoleCookie(null);
        set({ accessToken: null, isAuthenticated: false, user: null });
        return false;
      }

      const token = getApiAccessToken();
      set({ accessToken: token });

      try {
        const response = await authService.checkSession();
        const user = normalizeUser(response);
        if (user) {
          syncRoleCookie(user.role);
          set({ user, isAuthenticated: true });
          return true;
        }
      } catch {
        // Ignored
      }

      return true;
    } catch {
      syncRoleCookie(null);
      setApiAccessToken(null);
      set({ accessToken: null, isAuthenticated: false, user: null });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      syncRoleCookie(null);
      setApiAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedSession: true,
        error: null,
      });
    }
  },

  verifyEmailChange: async (token) => {
    try {
      const response = await authService.verifyEmailChange({ token });
      const msg =
        typeof response === 'string' && response.trim()
          ? response.trim()
          : response && typeof response === 'object' && typeof (response as Record<string, unknown>).message === 'string'
          ? String((response as Record<string, unknown>).message)
          : 'Email address updated successfully.';
      return {
        success: true,
        statusCode: 200,
        data: response,
        message: msg,
      };
    } catch (err: unknown) {
      const statusCode = err instanceof ApiError ? err.statusCode : 400;
      return {
        success: false,
        statusCode,
        message:
          err instanceof Error
            ? err.message
            : 'Invalid or expired verification token.',
      };
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => {
    syncRoleCookie(user ? user.role : null);
    set({ user, isAuthenticated: Boolean(user) });
  },
  syncProfileToUser: (profile) => {
    const current = get().user;
    if (!current) return;
    const nextAvatar =
      profile.profile_pic !== undefined
        ? profile.profile_pic || undefined
        : profile.avatarUrl !== undefined
        ? profile.avatarUrl
        : current.avatarUrl;
    const updated: User = {
      ...current,
      ...(profile.name ? { name: profile.name } : {}),
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.status ? { status: profile.status } : {}),
      ...(profile.phone !== undefined ? { phone: profile.phone ?? undefined } : {}),
      avatarUrl: nextAvatar,
      emailVerified:
        profile.is_email_verified !== undefined
          ? profile.is_email_verified
          : current.emailVerified,
      updatedAt: profile.updatedAt || profile.updated_at || current.updatedAt,
    };
    set({ user: updated });
  },
}));
