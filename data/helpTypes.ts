import { HelpTypeOption } from '../types/helpRequest';

export const helpTypes: HelpTypeOption[] = [
{
  id: 'crossing',
  title: 'Menyeberang Jalan',
  description: 'Pendampingan aman saat melintasi jalan.'
},
{
  id: 'stairs',
  title: 'Navigasi Tangga',
  description: 'Bantuan melewati tangga atau perbedaan elevasi.'
},
{
  id: 'carrying',
  title: 'Membawa Barang',
  description: 'Bantuan membawa barang ringan di sekitar Anda.'
},
{
  id: 'other',
  title: 'Lainnya',
  description: 'Jelaskan bantuan ringan lain yang dibutuhkan.'
}];