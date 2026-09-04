Tentang Produk

RangkulMap adalah platform smart spatial mapping berbasis web yang mengintegrasikan pemetaan infrastruktur inklusif dengan sistem bantuan fisik cepat (micro-volunteering) secara real-time. Mendukung SDG 11 (Kota dan Komunitas Berkelanjutan).

Tagline: "Merangkul setiap langkah, di setiap ruang kota."

Pendekatan visual: Contextual Warm Utility — presisi ala Uber/Google Maps untuk fungsi kritis, dipadukan kehangatan karakter geometris untuk ekosistem relawan.

Arsitektur Contextual UI Split (WAJIB dipahami AI sejak prompt pertama)

Seluruh antarmuka dibagi tegas jadi dua zona visual. Setiap prompt ke Magic Patterns harus menyebut zona mana yang sedang dikerjakan:

ZONA A — Utility & Emergency (kaku, presisi, kontras tinggi) → Peta spasial, navigasi, tombol SOS, verifikasi darurat, form booking pendamping medis. → Bebas dari karakter maskot apa pun. Hanya simbol standar internasional (kursi roda, penyeberangan, ikon medis). → Boleh pakai motif "Riak Rangkul" (lingkaran konsentris) untuk visualisasi radius/geolokasi — ini pola geometris fungsional, bukan karakter, jadi tetap sesuai aturan zona ini.

ZONA B — Gamifikasi & Komunitas (ceria, hangat, memotivasi) → Onboarding/tutorial, profil relawan, empty state, papan peringkat, kartu reward. → Boleh dan dianjurkan pakai karakter "Geo-Friends".

Tiga Peran Pengguna
Peran	Kebutuhan Utama
Pencari Bantuan	Disabilitas, lansia, individu rentan — butuh bantuan fisik ringan & respons darurat cepat
Relawan	Warga sekitar, memberi bantuan cepat, dapat XP/badge/reward
Mitra Profesional	Perawat/pendamping medis terverifikasi untuk kebutuhan kompleks
Sistem Desain

Palet warna (pakai hex ini persis — sebutkan versi light DAN dark tiap kali brief warna ke AI):

Elemen	Light Mode	Dark Mode	Fungsi
Primary Brand	
#0F4C81	
#1A8CFF	Kepercayaan, navigasi, tombol utama
SOS Emergency	
#D32F2F	
#FF5252	Khusus elemen darurat — jangan dipakai di elemen lain apa pun
Trust / Verified	
#2E7D32	
#4CAF50	Badge verifikasi, status aman
Gamification Accent	
#FFA000	
#FFD54F	XP, poin, badge — hanya di Zona B
Background Utama	
#F8F9FA	
#000000 (pure black)	Kontras maksimal, target WCAG AAA
Card Surface	
#FFFFFF	
#1E1E1E	Modul bento grid

Tipografi: Plus Jakarta Sans (fallback: Inter) — dipakai konsisten di seluruh app, tidak ada font kedua.

H1: 32px / Bold / line-height 1.2 — judul modul, konfirmasi SOS
H2/H3: 20–24px / SemiBold — nama lokasi, kategori bantuan
Body: 16px / Regular — instruksi navigasi, deskripsi
Caption/Label: 14px / Medium — status relawan, trust score

Motif "Riak Rangkul" (Zona A saja): pola lingkaran konsentris menyebar. Dipakai di animasi loading pencarian relawan dan visualisasi eskalasi radius SOS. Makna ganda: radius geolokasi literal + "lingkaran kepedulian meluas" secara metafora.

Sistem Maskot "Geo-Friends" (Zona B saja):

Dino-Square — dinosaurus dari bangun persegi & segitiga, menyimbolkan kekuatan & kesiapan bantuan fisik. Avatar ini yang "evolve" seiring level relawan naik (misal Level 1 = Dino Telur Segitiga, Level 10 = Dino Armor Persegi).
Circle-Mon — monster bulat bersahabat, menyimbolkan komunitas & keterhubungan sosial.
Tri-Guide — karakter segitiga navigasi, menyimbolkan petunjuk arah & akurasi lokasi.
Gaya visual: flat vector 2D tanpa bayangan kompleks, stroke tebal & jelas, warna pastel cerah yang tetap kontras di dark mode.

Aturan aksesibilitas (WCAG 2.1 AAA, wajib di semua layar):

Kontras warna minimum 7:1 untuk semua teks informasi kritis (bukan sekadar 4.5:1)
Target sentuh minimum 48×48px untuk semua elemen interaktif
Tidak pernah mengandalkan warna saja — selalu pasangkan ikon + label teks
Fokus keyboard terlihat jelas (visible focus ring)
True dark mode (bukan invert), kontras Merah SOS tetap terjaga
Hormati preferensi reduced-motion
Screen reader ready: SEMUA elemen non-teks termasuk karakter Geo-Friends punya aria-label deskriptif, contoh: aria-label="Karakter Dino Segitiga: Level Relawan 5"
Voice command: aktivasi darurat/navigasi via perintah suara, contoh: "RangkulMap, minta bantuan menyeberang"
Haptic & audio feedback dengan pola berbeda untuk tiap aksi penting (tekan SOS vs terima permintaan bantuan)
Mobile-first, fully responsive
Rincian Layar (dengan penanda zona)

1. Onboarding & Pemilihan Peran [ZONA B] — Kini bagian dari alur Sign Up opsional (bukan gerbang wajib di awal aplikasi). Pengguna baru langsung mendarat di Dashboard/Peta Utama dalam mode Guest; layar ini disiapkan untuk disambungkan saat Guest memilih "Log In / Daftar" dari top bar. Splash logo + tagline, karakter Geo-Friends menyambut. Toggle bahasa & kontras tinggi sejak layar pertama. Tiga kartu besar pilihan peran. Form registrasi beda per peran (sama seperti sebelumnya: data diri, verifikasi KTP/swafoto untuk relawan, lisensi/STR untuk mitra profesional).

2. Dashboard Beranda [ZONA A dominan, elemen B minor] — Layout Full-Screen Map-Centric with Floating Bento Sheets. Pencari Bantuan: peta ~60% layar atas, dua tombol besar ("Minta Bantuan" teal + FAB SOS merah terpisah), section horizontal-scroll relawan terdekat. Relawan: toggle Online/Offline, peta pin permintaan aktif, mini-card XP dengan avatar Dino-Square kecil (elemen B yang diizinkan masuk ke dashboard). Mitra Profesional: kalender booking, list klien, badge verifikasi.

3. Peta Infrastruktur Inklusif [ZONA A murni] — Full-screen, filter chip mengambang (5 kategori: Jalur Ramah Kursi Roda, Toilet Aksesibel, Lift, Parkir Disabilitas, Halte Aksesibel), marker hijau (terverifikasi)/abu-abu (belum). FAB "Laporkan Titik Baru" → modal foto+kategori+kondisi+catatan. Tap marker → bottom sheet "Konfirmasi Masih Akurat"/"Laporkan Berubah". Tidak ada elemen maskot sama sekali di layar ini.

4. Alur Minta Bantuan (Micro-Volunteering) [ZONA A] — grid pilihan jenis bantuan → konfirmasi lokasi → layar loading dengan animasi Riak Rangkul + teks "Mencari relawan dalam radius 500m..." → kartu relawan cocok muncul dari bawah → tracking live → rating dua arah pasca-sesi.

5. Alur SOS Darurat [ZONA A paling ketat] — lihat detail step-by-step di Bagian 2, fitur paling kritis.

6. Booking Layanan Profesional [ZONA A] — Layout form transaksional bersih ala Uber. Grid card mitra (foto, badge hijau "Terverifikasi", spesialisasi, rating, tarif). Detail profil: bio, sertifikasi STR dengan ikon centang, ulasan klien. Alur booking: date picker, slider durasi, catatan kebutuhan khusus, ringkasan biaya transparan.

7. Gamifikasi — Profil Relawan [ZONA B penuh] — Layout Bento Grid, 3 kartu utama: (1) Statistik Dampak — bantuan selesai, trust score, total XP; (2) Avatar Dino-Square yang evolve sesuai level; (3) Voucher & Reward. Tab tambahan: Papan Peringkat (opsi anonim), Badge grid (locked=siluet abu-abu+ikon gembok, unlocked=warna penuh dengan karakter Circle-Mon/Tri-Guide sebagai varian badge).

8. Pengaturan Aksesibilitas [Zona netral, fungsional tapi boleh sedikit hangat] — Segmented control Light/Dark/Ikuti Sistem. Slider ukuran teks (4 tingkat, live preview). Toggle Kontras Tinggi (target 7:1). Section Voice Command dengan contoh perintah. Info kompatibilitas screen reader. Pilihan bahasa.

9. Profil & Riwayat [ZONA A/netral] — Info akun & kontak darurat. Trust score & cara meningkatkan. Riwayat aktivitas (termasuk log SOS yang dibatalkan, untuk transparansi/audit). Pengaturan privasi lokasi.

Alur Kritis: SOS Darurat (ikuti persis urutannya, ini yang paling sering meleset)
FAB SOS (merah 
#D32F2F light / 
#FF5252 dark, ikon lonceng darurat) selalu terlihat, terpisah visual dari "Minta Bantuan". Tidak ada elemen Geo-Friends di sekitar tombol ini.
Press-and-hold 3 detik — progress ring animasi mengelilingi tombol + haptic feedback bertahap.
Setelah tertahan 3 detik → full-screen takeover merah-hitam kontras tinggi, angka countdown besar (jumbo, mengikuti skala H1 atau lebih besar) mundur dari 10, tombol "BATALKAN" besar di area jangkauan ibu jari.
Tap Batalkan sebelum 0 → kembali ke dashboard, tidak ada apa pun terkirim.
Countdown mencapai 0 → sistem kirim micro-confirmation senyap ke 2–3 relawan trust score tertinggi terdekat (bukan broadcast penuh, lokasi kasar/radius bukan titik presisi). Layar relawan: notifikasi khusus (visual & getar beda dari biasa), dua tombol besar "Ini Darurat Nyata, Saya Menuju" (hijau) / "Sepertinya Bukan Darurat" (abu-abu).
Layar Pencari Bantuan: status "Mengonfirmasi ke relawan terdekat..." + progress "1 dari 3 relawan telah merespons". Sertakan juga tombol panggilan langsung ke layanan darurat medis resmi, tetap terlihat di layar ini.
Begitu ada 1 konfirmasi ATAU timeout 30 detik → auto-eskalasi ke broadcast SOS radius penuh (motif Riak Rangkul untuk visualisasi radius) + kirim koordinat presisi ke sistem tim medis/darurat.
Layar broadcast penuh: peta menampilkan semua responder dengan status masing-masing (menuju/tiba).
Riwayat log SOS (termasuk yang dibatalkan) tersimpan di halaman Profil & Riwayat.
Aturan mutlak: seluruh alur ini bebas dari karakter Geo-Friends, ilustrasi playful, atau warna gamifikasi apa pun.
Data Contoh (pakai untuk mock data, bukan Lorem Ipsum)
Pencari Bantuan: Bu Sri Wahyuni, 68 tahun, pengguna kursi roda, domisili Yogyakarta
Relawan: Dimas Prasetyo, Trust Score 92, Level 12, badge "Penolong Setia", domisili Bandung
Mitra Profesional: Ns. Ratna Kusuma, S.Kep, spesialisasi pendampingan lansia, domisili Surabaya
Kota lain: Jakarta
Voucher sponsor: diskon transportasi online, diskon apotek, diskon kafe lokal