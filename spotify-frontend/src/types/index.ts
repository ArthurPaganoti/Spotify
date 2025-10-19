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
  avatarUrl?: string;
}

export interface UserProfileUpdateDTO {
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
  imageUrl?: string;
  youtubeVideoId?: string;
  youtubeThumbnailUrl?: string;
  createdByUserId: number | null;
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  likesCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ResponseDTO<T> {
  content: T;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface PlaylistDTO {
  id: number;
  name: string;
  imageUrl?: string;
  imageFileId?: string;
  isPublic: boolean;
  userId: number;
  userName: string;
  musicCount: number;
  isCollaborator?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MusicInPlaylistDTO {
  id: string;
  name: string;
  genre: string;
  band: string;
  imageUrl?: string;
  imageFileId?: string;
  youtubeVideoId?: string;
  youtubeThumbnailUrl?: string;
  position: number;
  addedAt: string;
}

export interface PlaylistWithMusicsDTO {
  id: number;
  name: string;
  imageUrl?: string;
  imageFileId?: string;
  isPublic: boolean;
  userId: number;
  userName: string;
  musics: MusicInPlaylistDTO[];
  isCollaborator?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaylistRequest {
  name: string;
  imageUrl?: string;
  imageFileId?: string;
  isPublic: boolean;
}

export interface UpdatePlaylistRequest {
  name?: string;
  imageUrl?: string;
  imageFileId?: string;
  isPublic?: boolean;
}

export interface AddMusicToPlaylistRequest {
  musicId: string;
}

export interface CollaboratorDTO {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  status: string;
  invitedByUserId: number;
  invitedByUserName: string;
  invitedAt: string;
  respondedAt?: string;
}

export interface CollaboratorInviteDTO {
  id: number;
  playlistId: number;
  playlistName: string;
  playlistImageUrl?: string;
  invitedByUserId: number;
  invitedByUserName: string;
  status: string;
  invitedAt: string;
}

export interface InviteCollaboratorRequest {
  email: string;
}
