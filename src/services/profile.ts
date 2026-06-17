import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type { ApiResponse } from '@/types/common.ts';
import type {
  Profile,
  UpdateProfileRequest,
  UserAvatar
} from '@/types/profile.ts';

export const profileService = {
  profile: (username: string): Promise<ApiResponse<Profile>> =>
    api.get(API.PROFILE.BASE, { username }),
  updateProfile: (data: UpdateProfileRequest): Promise<ApiResponse<void>> =>
    api.patch(API.PROFILE.UPDATE, data),
  getAvatar: (): Promise<ApiResponse<UserAvatar[]>> =>
    api.get(API.PROFILE.AVATAR),
  uploadAvatar: (file: File): Promise<ApiResponse<UserAvatar>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(API.PROFILE.AVATAR, formData);
  },
  deleteAvatar: (ids: number[]): Promise<ApiResponse<void>> =>
    api.delete(API.PROFILE.AVATAR, { ids })
};
