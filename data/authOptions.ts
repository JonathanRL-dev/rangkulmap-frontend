import { UserRole } from '../types/auth';

export const roleOptions: Array<{
  id: UserRole;
  title: string;
  description: string;
  accent: 'primary' | 'warning' | 'success';
}> = [
{
  id: 'seeker',
  title: 'Saya Pencari Bantuan',
  description: 'Temukan relawan terdekat untuk bantuan sehari-hari dan kebutuhan mobilitas.',
  accent: 'primary'
},
{
  id: 'volunteer',
  title: 'Saya Relawan',
  description: 'Bantu orang di sekitar Anda dan bangun kepercayaan bersama komunitas.',
  accent: 'warning'
},
{
  id: 'professional',
  title: 'Saya Mitra Profesional',
  description: 'Tawarkan layanan profesional terverifikasi untuk mendampingi komunitas.',
  accent: 'success'
}];


export const assistanceNeeds = [
'Mobilitas & kursi roda',
'Menyeberang jalan',
'Pendampingan lansia',
'Membaca informasi',
'Bahasa isyarat',
'Bantuan darurat ringan'];