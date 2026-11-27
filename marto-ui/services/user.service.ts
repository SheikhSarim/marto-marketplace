import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import { UpdateAvatarResponse, UpdateProfileDto, UserProfile, UserRole } from '@/types';

const ALLOWED_AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

function unwrapRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>;
  }
  return obj;
}

export function normalizeUserProfile(raw: unknown): UserProfile {
  const rec = unwrapRecord(raw);
  const rawRole = String(rec.role || '').toUpperCase();
  const role: UserRole =
    rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN'
      ? 'SUPER_ADMIN'
      : rawRole === 'SELLER'
      ? 'SELLER'
      : 'CUSTOMER';

  const profilePic =
    typeof rec.profile_pic === 'string' && rec.profile_pic.trim()
      ? rec.profile_pic.trim()
      : typeof rec.avatarUrl === 'string' && rec.avatarUrl.trim()
      ? rec.avatarUrl.trim()
      : typeof rec.avatar === 'string' && rec.avatar.trim()
      ? rec.avatar.trim()
      : null;

  const createdAt =
    typeof rec.created_at === 'string'
      ? rec.created_at
      : typeof rec.createdAt === 'string'
      ? rec.createdAt
      : '';

  const updatedAt =
    typeof rec.updated_at === 'string'
      ? rec.updated_at
      : typeof rec.updatedAt === 'string'
      ? rec.updatedAt
      : createdAt;

  return {
    id: String(rec.id || ''),
    name: typeof rec.name === 'string' ? rec.name : '',
    email: typeof rec.email === 'string' ? rec.email : '',
    role,
    status: typeof rec.status === 'string' ? rec.status : undefined,
    profile_pic: profilePic,
    avatarUrl: profilePic || undefined,
    phone: typeof rec.phone === 'string' ? rec.phone : null,
    is_email_verified: Boolean(rec.is_email_verified ?? rec.email_verified ?? rec.emailVerified ?? true),
    created_at: typeof rec.created_at === 'string' ? rec.created_at : undefined,
    createdAt,
    updated_at: typeof rec.updated_at === 'string' ? rec.updated_at : undefined,
    updatedAt,
  };
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed.';
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return 'Profile picture size must not exceed 5 MB.';
  }
  return null;
}

export const userService = {
  async getMyProfile(): Promise<{ profile: UserProfile; raw: unknown }> {
    if (!ENDPOINTS.USER_PROFILE_GET.available) {
      throw new ApiNotAvailableError(
        'USER_PROFILE_GET',
        'GET',
        ENDPOINTS.USER_PROFILE_GET.path
      );
    }
    const res = await apiClient.get(ENDPOINTS.USER_PROFILE_GET.path);
    return { profile: normalizeUserProfile(res), raw: res };
  },

  async updateMyProfile(dto: UpdateProfileDto): Promise<{ profile: UserProfile; raw: unknown }> {
    if (!ENDPOINTS.USER_PROFILE_UPDATE.available) {
      throw new ApiNotAvailableError(
        'USER_PROFILE_UPDATE',
        'PATCH',
        ENDPOINTS.USER_PROFILE_UPDATE.path
      );
    }

    const payload: UpdateProfileDto = {};
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      const trimmedPhone = dto.phone.trim();
      if (trimmedPhone) {
        payload.phone = trimmedPhone;
      }
    }

    const res = await apiClient.patch(ENDPOINTS.USER_PROFILE_UPDATE.path, payload);
    return { profile: normalizeUserProfile(res), raw: res };
  },

  async updateMyAvatar(file: File): Promise<UpdateAvatarResponse> {
    if (!ENDPOINTS.USER_PROFILE_AVATAR.available) {
      throw new ApiNotAvailableError(
        'USER_PROFILE_AVATAR',
        'PATCH',
        ENDPOINTS.USER_PROFILE_AVATAR.path
      );
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.patch(ENDPOINTS.USER_PROFILE_AVATAR.path, formData);
    const rec = unwrapRecord(res);
    const outer = res && typeof res === 'object' ? (res as Record<string, unknown>) : {};

    return {
      message:
        typeof outer.message === 'string'
          ? outer.message
          : typeof rec.message === 'string'
          ? rec.message
          : 'Profile picture updated successfully.',
      profile_pic:
        typeof rec.profile_pic === 'string'
          ? rec.profile_pic
          : typeof outer.profile_pic === 'string'
          ? outer.profile_pic
          : '',
    };
  },
};
