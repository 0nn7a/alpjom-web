// 資料庫裡的完整使用者物件
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

// 註冊 request body
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登入 request body
export interface LoginRequest {
  email: string;
  password: string;
}

// 登入成功後，後端回傳的資料
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiredAt: number; // 對應後端的 Long
  refreshExpiredAt: number;
}

// 換發成功後，後端回傳的資料
export interface RefreshResponse {
  token: string;
  expiredAt: number; // 對應後端的 Long
}

// 修改用戶基本資料
export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
}

// 修改密碼（通常需要驗證舊密碼）
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
