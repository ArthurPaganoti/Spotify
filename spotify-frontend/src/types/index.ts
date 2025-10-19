export interface UserRegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface MusicRequestDTO {
  name: string;
  genre: string;
  band: string;
}

export interface MusicResponseDTO {
  id: string;
  name: string;
  genre: string;
  band: string;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseDTO<T> {
  content: T;
  message: string;
  success: boolean;
  timestamp?: string;
}
