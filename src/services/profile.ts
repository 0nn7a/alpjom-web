import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type { ApiResponse } from '@/types/common.ts';
import type {
  Profile,
  UpdatePasswordRequest,
  UpdateUserRequest,
  UserAvatar,
  UserFollow
} from '@/types/profile.ts';
import type { User } from '@/types/auth.ts';

export const profileService = {
  profile: (username: string): Promise<ApiResponse<Profile>> =>
    api.get(API.PROFILE.BASE, { username }),

  updateUser: (data: UpdateUserRequest): Promise<ApiResponse<void>> =>
    api.patch(API.PROFILE.USER, data),
  updatePassword: async (
    data: UpdatePasswordRequest
  ): Promise<ApiResponse<void>> => api.patch(API.PROFILE.PASSWORD, data),

  getAvatar: (): Promise<ApiResponse<UserAvatar[]>> =>
    api.get(API.PROFILE.AVATAR),
  uploadAvatar: (file: File): Promise<ApiResponse<UserAvatar>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(API.PROFILE.AVATAR, formData);
  },
  deleteAvatar: (ids: number[]): Promise<ApiResponse<void>> =>
    api.delete(API.PROFILE.AVATAR, { ids }),

  getFollower: (username: string): Promise<ApiResponse<User[]>> =>
    api.get(`${API.PROFILE.FOLLOW.FOLLOWER}/${username}`),
  getFollowing: (username: string): Promise<ApiResponse<User[]>> =>
    api.get(`${API.PROFILE.FOLLOW.FOLLOWING}/${username}`),
  toggleFollow: (followingUsername: string): Promise<ApiResponse<UserFollow>> =>
    api.post(`${API.PROFILE.FOLLOW.BASE}/${followingUsername}`)
};
