export interface VoiceCommandExample {
  command: string;
  outcome: string;
}

export const voiceCommandExamples: VoiceCommandExample[] = [
{
  command: '"RangkulMap, minta bantuan menyeberang"',
  outcome: 'Membuka alur Minta Bantuan dengan jenis Menyeberang Jalan.'
},
{
  command: '"RangkulMap, cari toilet aksesibel terdekat"',
  outcome: 'Memfilter Peta Infrastruktur Inklusif ke kategori Toilet Aksesibel.'
},
{
  command: '"RangkulMap, panggil bantuan darurat"',
  outcome: 'Menyiapkan konfirmasi SOS sebelum permintaan dikirim.'
}];


export const languageOptions: {code: 'id' | 'en' | 'jv';label: string;}[] = [
{ code: 'id', label: 'Bahasa Indonesia' },
{ code: 'en', label: 'English' },
{ code: 'jv', label: 'Basa Jawa' }];