import { z } from 'zod';

export const musicSchema = z.object({
  name: z.string()
    .min(1, 'O nome da música é obrigatório')
    .max(200, 'O nome deve ter no máximo 200 caracteres')
    .trim(),
  band: z.string()
    .min(1, 'O nome da banda/artista é obrigatório')
    .max(200, 'O nome da banda deve ter no máximo 200 caracteres')
    .trim(),
  genre: z.string()
    .min(1, 'O gênero musical é obrigatório')
    .max(50, 'O gênero deve ter no máximo 50 caracteres')
    .trim(),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'A imagem deve ter no máximo 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Apenas imagens JPG, PNG ou WEBP são permitidas'
    )
    .optional()
});

export const musicByLyricsSchema = z.object({
  lyrics: z.string()
    .min(10, 'Digite pelo menos 10 caracteres da letra')
    .max(1000, 'O trecho da letra deve ter no máximo 1000 caracteres')
    .trim(),
  genre: z.string()
    .max(50, 'O gênero deve ter no máximo 50 caracteres')
    .trim()
    .optional()
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email muito longo'),
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(255, 'Senha muito longa')
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'O nome é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email muito longo'),
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(255, 'Senha muito longa'),
  confirmPassword: z.string()
    .min(1, 'Confirme sua senha')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  name: z.string()
    .min(1, 'O nome é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email muito longo'),
  avatar: z.instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'A imagem deve ter no máximo 2MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Apenas imagens JPG, PNG ou WEBP são permitidas'
    )
    .optional()
});

export type MusicFormData = z.infer<typeof musicSchema>;
export type MusicByLyricsFormData = z.infer<typeof musicByLyricsSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
