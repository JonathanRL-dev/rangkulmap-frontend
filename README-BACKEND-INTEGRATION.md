# Panduan Integrasi Backend RangkulMap

Dokumen ini ditujukan untuk developer backend yang akan mengganti data simulasi frontend dengan API dan Socket.io sebenarnya.

> **Catatan struktur:** project ini memakai TypeScript dan seluruh source berada langsung di root, bukan di dalam `src/`. Karena itu, path aktual adalah `config/env.ts`, `services/*.ts`, dan `hooks/*.ts`. Nama tersebut setara dengan file `.js` yang disebut dalam spesifikasi integrasi.
>
> `rangkulmap-api-contract.md` belum tersedia di repository ini. Daftar endpoint di bawah adalah kontrak yang sudah diasumsikan oleh implementasi frontend saat ini. Cocokkan payload/response akhirnya dengan dokumen kontrak tersebut ketika ditambahkan.

## Gambaran aliran data

```text
Page / Component
      ↓ hanya memanggil hook
hooks/use*.ts
      ↓ memanggil service
services/*Service.ts
      ↓ resolveWithMock(mock, live)
services/apiClient.ts
      ↓
REST API backend
```

Komponen tidak memilih data mock atau data asli. Pemilihan tersebut hanya terjadi di service layer melalui `resolveWithMock()`. Error dari mock maupun API asli juga keluar dalam bentuk yang sama:

```ts
{
  type: 'network' | 'validation' | 'notfound' | 'server';
  message: string;
}
```

---

## 1. Autentikasi, token, dan session user

### File utama

| Tanggung jawab | Lokasi |
|---|---|
| Penyimpanan token, session, akun mock, dan operasi auth | `services/authService.ts` |
| Attach token dan penanganan respons `401` | `services/apiClient.ts` |
| Status auth yang dikonsumsi komponen | `hooks/useAuth.ts` |
| Bentuk `AuthUser`, role, status, dan payload register | `types/auth.ts` |
| Nama key token yang dapat dikonfigurasi | `config/env.ts` |

Tidak ada `AuthProvider`. `authService` menyimpan snapshot user aktif dalam module state, lalu `useAuth()` berlangganan melalui `useSyncExternalStore()` menggunakan `subscribeToAuth()` dan `getAuthSnapshot()`.

### Penyimpanan lokal

| Key | Isi | Kapan dipakai |
|---|---|---|
| `rangkulmap.auth.session.v2` | Object user yang sedang login | Mock dan cache session frontend |
| `rangkulmap.auth.accounts.v2` | Daftar akun mock beserta password | Hanya mode mock |
| Nilai `AUTH_TOKEN_STORAGE_KEY` | Access token; default `rangkulmap.auth.token` | Mode API asli |
| Nilai `AUTH_REFRESH_TOKEN_STORAGE_KEY` | Refresh token; default `rangkulmap.auth.refresh-token` | Mode API asli |

Key lama `rangkulmap.auth.session` dan `rangkulmap.auth.accounts` masih dibaca untuk migrasi, lalu dipindahkan ke key `.v2`.

### Lifecycle auth

1. `login()` atau `register()` menerima `AuthApiResponse` dari backend.
2. `authService` menyimpan `user` ke session dan menyimpan `access_token`/`refresh_token` ke key yang ditentukan oleh environment.
3. `apiClient` membaca access token tersebut sebelum request dan memasang header:

   ```http
   Authorization: Bearer <access_token>
   X-Client-App: RangkulMap
   Accept: application/json
   ```

4. Saat aplikasi dimuat dengan `USE_MOCK_DATA=false`, `useAuth()` memanggil `GET /auth/me` melalui `getCurrentUser()`.
5. Respons `401` memicu unauthorized handler di `authService`, yang membersihkan session dan token agar aplikasi kembali menjadi Guest.
6. `logout()` memanggil `POST /auth/logout`, lalu tetap membersihkan state lokal dan semua token.

### API auth yang diharapkan

| Fungsi service | HTTP endpoint | Catatan |
|---|---|---|
| `login(email, password)` | `POST /auth/login` | Request auth publik (`skipAuth`) |
| `register(payload)` | `POST /auth/register` | Request auth publik (`skipAuth`) |
| `getCurrentUser()` | `GET /auth/me` | Menggunakan Bearer token |
| `logout()` | `POST /auth/logout` | Session lokal dibersihkan setelah request |
| `updateUsername(newUsername)` | `PATCH /auth/me/username` | Body `{ username }` |

Response login/register saat ini diharapkan berbentuk:

```ts
{
  user: AuthUser;
  access_token?: string;
  refresh_token?: string;
}
```

### Hook yang dipakai UI

```ts
const {
  user,           // AuthUser | null
  isGuest,        // true bila user === null
  isLoading,
  error,
  login,
  register,
  logout,
  updateUsername,
  clearError,
} = useAuth();
```

`useAuth()` dipakai oleh Dashboard, Sign In, Sign Up, Profil, alur Minta Bantuan, halaman Semua Relawan, Booking, Progression, Mailbox, permintaan masuk relawan, dan `useSos()`.

---

## 2. Konfigurasi API dan environment variable

Semua environment variable dibaca hanya di `config/env.ts`. Untuk setiap nama, frontend memeriksa versi `VITE_<NAMA>` terlebih dahulu, lalu `<NAMA>` tanpa prefix. Untuk build Vite, gunakan prefix `VITE_`.

Contoh:

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://api.rangkulmap.id/v1
VITE_SOCKET_URL=https://api.rangkulmap.id
```

### Daftar lengkap

| Nama | Default | Kegunaan ketika backend siap |
|---|---|---|
| `APP_ENV` | `development` | Label environment: `development`, `staging`, atau `production` |
| `APP_NAME` | `RangkulMap` | Nilai header `X-Client-App` dan identitas log |
| `API_BASE_URL` | `https://api.rangkulmap.local/v1` | Base URL seluruh REST endpoint |
| `API_TIMEOUT_MS` | `15000` | Timeout request sebelum `AbortController` membatalkan request |
| `SOCKET_URL` | `wss://api.rangkulmap.local` | Origin/gateway realtime |
| `SOCKET_PATH` | `/socket.io` | Path handshake Socket.io |
| `ENABLE_REALTIME` | `true` | Master switch koneksi realtime |
| `SOS_DISABLED_FOR_TESTING` | `true` | Kill switch SOS; `triggerSos()` langsung mengembalikan status `disabled` tanpa API atau simulasi socket |
| `AUTH_TOKEN_STORAGE_KEY` | `rangkulmap.auth.token` | Key localStorage access token |
| `AUTH_REFRESH_TOKEN_STORAGE_KEY` | `rangkulmap.auth.refresh-token` | Key localStorage refresh token |
| `MAP_TILE_URL` | OpenStreetMap tile URL | Tile provider untuk peta |
| `USE_MOCK_DATA` | `true` | `true`: service mock; `false`: REST/realtime asli |
| `MOCK_LATENCY_MS` | `1200` | Latency buatan agar loading state dapat diuji |
| `SIMULATE_ERRORS` | `false` | Mengaktifkan kegagalan service secara acak |
| `SIMULATE_ERROR_RATE` | `0.1` | Probabilitas kegagalan per service call (10%) |

### Gate SOS selama testing: `SOS_DISABLED_FOR_TESTING`

Flag `SOS_DISABLED_FOR_TESTING` adalah pengunci sementara untuk mencegah interaksi tombol SOS selama masa testing. Nilai default-nya saat ini `true`. Gate ini tidak menghapus atau mengubah service, hook, komponen, countdown, micro-confirmation, broadcast, event realtime, maupun schema SOS yang sudah ada; seluruh implementasi tersebut tetap tersedia dan akan digunakan kembali saat gate dibuka.

Flag diperiksa pada dua lapisan:

- `services/sosService.ts` — `triggerSos()` langsung mengembalikan sesi dengan status `disabled` sebelum request API, pembuatan mock session, error simulation, atau stream Socket dijalankan.
- `hooks/useSos.ts` — mencegah pengiriman serta inisialisasi koneksi realtime ketika gate aktif, lalu mengekspos `isSosDisabled` agar komponen UI dapat menampilkan kondisi nonaktif tanpa mengimpor `config/env.ts` secara langsung.

Setelah masa testing selesai, buka gate melalui environment deployment:

```env
VITE_SOS_DISABLED_FOR_TESTING=false
```

Atau ubah fallback `SOS_DISABLED_FOR_TESTING` menjadi `false` di `config/env.ts`. Setelah itu, restart/rebuild frontend agar nilai environment baru terbaca. Tidak diperlukan perubahan pada service, hook, komponen, atau schema SOS.

`services/apiClient.ts` memakai `API_BASE_URL`, timeout, dan token di atas. File tersebut juga menjadi interceptor terpusat untuk:

- menyusun query string;
- memasang Bearer token;
- mengurai JSON response;
- menjalankan handler `401`;
- memetakan `400/401/403/422` → `validation`, `404` → `notfound`, `5xx` → `server`, timeout/offline/fetch failure → `network`;
- memilih mock atau API asli melalui `resolveWithMock(mock, live)`.

Backend sebaiknya selalu mengirim body error JSON minimal:

```json
{ "message": "Pesan error yang aman ditampilkan kepada pengguna" }
```

### Simulasi error

Untuk memeriksa seluruh tampilan error tanpa backend gagal sungguhan:

```env
VITE_SIMULATE_ERRORS=true
VITE_SIMULATE_ERROR_RATE=0.1
```

Simulasi dapat dikendalikan saat runtime melalui `configureErrorSimulation()` di `services/apiClient.ts`. Prototype juga mengekspos prop App `simulateRandomServiceErrors` untuk menyalakan simulasi sekitar 10% melalui Controls.

---

## 3. Titik integrasi Socket.io

### Lokasi dan pemanggil

- Transport terpusat: `services/socketClient.ts`.
- Service pemicu stream SOS: `services/sosService.ts`.
- Satu-satunya subscriber UI: `hooks/useSos.ts`.
- `useSos()` dipakai oleh `pages/SeekerHomeDashboard.tsx` untuk FAB, countdown, micro-confirmation, broadcast, lokasi relawan, dan layar gagal SOS.

Saat `useSos()` mount, hook memanggil `socketClient.connect()` dan mendaftarkan listener melalui `socketClient.on()`. Komponen tidak pernah mengakses object socket secara langsung.

### Event realtime

Nama event berikut harus sama persis di gateway:

| Event | Arah saat ini | Payload penting | Efek frontend |
|---|---|---|---|
| `sos:progress` | Server → client | `sos_id`, `status`, `elapsed_seconds`, `notified_volunteers`, `responded_volunteers` | Memperbarui progres broadcast |
| `volunteer:location_update` | Server → client | `sos_id`, `volunteer_id`, `latitude`, `longitude`, `eta_minutes` | Memperbarui lokasi/ETA relawan |
| `sos:status_change` | Server → client | `sos_id`, `status`, `changed_at` | Memperbarui fase SOS; reset saat `cancelled`/`resolved` |

Setiap listener memfilter payload berdasarkan `sos_id` aktif. Saat ini tidak ada domain event Socket.io yang dikirim UI ke server: trigger/cancel menggunakan REST. Method generic `socketClient.emit(event, payload)` sudah tersedia bila gateway nanti membutuhkan client event.

Dalam mode mock, `simulateSosStream()` meniru server dengan:

- `sos:progress` setiap 2 detik;
- `volunteer:location_update` setiap 3 detik;
- `sos:status_change` ke `micro_confirmation` setelah 1,5 detik;
- `sos:status_change` ke `broadcasting` setelah 6 detik.

### Mengganti simulasi dengan `socket.io-client`

1. Tambahkan dependency `socket.io-client` ke `package.json`.
2. Di `services/socketClient.ts`, ganti implementation internal `WebSocket` dalam `connectLive()`:

   ```ts
   import { io, Socket } from 'socket.io-client';

   socket = io(env.SOCKET_URL, {
     path: env.SOCKET_PATH,
     auth: { token: accessToken },
   });
   ```

3. Petakan lifecycle transport ke status internal yang sudah ada:
   - `connect` → `connected`
   - `disconnect`/`connect_error` → `disconnected`
4. Daftarkan tiga event kontrak di atas dan teruskan payload ke fungsi internal `dispatch(event, payload)`. Alternatifnya gunakan `socket.onAny()`.
5. Ubah cabang live `emit()` menjadi `socket.emit(event, payload)`.
6. Pertahankan API publik `socketClient`: `connect`, `disconnect`, `on`, `emit`, `onStatusChange`, dan getter `status`.
7. Jangan ubah `useSos()` atau komponen. Keduanya transport-agnostic.
8. Set `VITE_USE_MOCK_DATA=false`, `VITE_ENABLE_REALTIME=true`, serta isi `VITE_SOCKET_URL` dan `VITE_SOCKET_PATH`.

---

## 4. Daftar service, hook, fungsi, dan pemanggil UI

### Services

#### `services/apiClient.ts`

Fondasi semua request dan error.

- `apiClient.get/post/patch/put/delete()` — request REST terpusat.
- `setAuthTokenProvider()` — menentukan sumber access token.
- `setUnauthorizedHandler()` — callback global untuk respons `401`.
- `createAppError()`, `toAppError()`, `isAppError()` — normalisasi error.
- `configureErrorSimulation()`, `getErrorSimulation()`, `maybeSimulateFailure()` — error testing.
- `deviceIsOffline()` — status koneksi perangkat.
- `mockResponse()` — latency mock.
- `resolveWithMock()` — memilih implementation mock atau live.

Dipanggil oleh seluruh service dan beberapa hook infrastruktur/testing; tidak dipanggil langsung oleh page.

#### `services/authService.ts`

- `login()` — `POST /auth/login`.
- `register()` — `POST /auth/register`.
- `getCurrentUser()` — `GET /auth/me`.
- `logout()` — `POST /auth/logout`.
- `updateUsername()` — `PATCH /auth/me/username`.
- `getAuthSnapshot()`, `subscribeToAuth()` — sinkronisasi hook.

UI masuk melalui `useAuth()`.

#### `services/uploadService.ts`

- `uploadPublicPhoto(file)` — ambil `GET /uploads/public-photo/config`, lalu unsigned upload langsung ke Cloudinary. Dipakai Sign Up/foto publik dan laporan titik infrastruktur.
- `uploadVerificationDocument(file)` — minta `POST /uploads/verification/signature`, signed upload langsung ke Cloudinary, lalu konfirmasi dengan `POST /uploads/verification/confirm`. Dipakai dokumen KTP/swafoto relawan dan sertifikasi mitra.

UI masuk melalui `useUpload()`; `infrastrukturService` juga memanggil public upload secara internal.

#### `services/geocodeService.ts`

- `searchAddress(query)` — `GET /map/geocode/search?query=...`.
- `reverseGeocode(lat, lng)` — `GET /map/geocode/reverse?lat=...&lng=...`.

UI masuk melalui `useGeocode()` pada Dashboard, Peta Infrastruktur, dan konfirmasi pin Minta Bantuan.

#### `services/infrastrukturService.ts`

- `getInfrastructureCategories()` — `GET /map/infrastructure/categories`.
- `getPointsInBounds(bounds)` — `GET /map/infrastructure/points` dengan batas peta.
- `reportNewPoint(payload)` — upload foto, lalu `POST /map/infrastructure/points/reports`.
- `confirmPoint(id)` — `POST /map/infrastructure/points/:id/confirm`.
- `reportPointChanged(id)` — `POST /map/infrastructure/points/:id/changed`.
- `DEFAULT_INFRASTRUCTURE_BOUNDS`, `DEFAULT_MAP_COORDINATES` — fallback mock/map awal.

UI masuk melalui `useInfrastruktur()` pada halaman Peta Infrastruktur.

#### `services/reviewService.ts`

- `submitReview(payload)` — `POST /reviews`.
- `getReviews(targetId, targetType)` — `GET /reviews` dengan filter target.

Dipakai bersama oleh `useBantuan()` untuk rating pasca-bantuan dan `bookingService` untuk ulasan mitra.

#### `services/bantuanService.ts`

- `getNearbyVolunteers(location)` — `GET /bantuan/volunteers/nearby`.
- `getIncomingRequests()` — `GET /bantuan/requests/incoming`.
- `createBantuanRequest(payload)` — `POST /bantuan/requests`.
- `acceptRequest(id)` — `POST /bantuan/requests/:id/accept`.
- `completeRequest(id)` — `POST /bantuan/requests/:id/complete`.
- `cancelRequest(id)` — `POST /bantuan/requests/:id/cancel`.
- `subscribeToBantuan()`, `getBantuanStoreVersion()` — sinkronisasi in-memory khusus mock.

UI masuk melalui `useBantuan()` pada Dashboard, Semua Relawan Terdekat, empat layar Minta Bantuan, permintaan masuk relawan, dan panel sesi bantuan aktif.

#### `services/sosService.ts`

- `triggerSos(location, requesterId)` — `POST /sos`.
- `cancelSos(sosId)` — `POST /sos/:id/cancel`.
- `getSosStatus(sosId)` — `GET /sos/:id`.
- `configureSosFailureSimulation(enabled)` — kegagalan mock khusus verifikasi layar alert SOS.

UI masuk melalui `useSos()` pada Dashboard.

#### `services/bookingService.ts`

- `getProfessionals(filters)` — `GET /professional-services`.
- `getProfessionalDetail(id)` — `GET /professional-services/:id`, kemudian menggabungkan `getReviews()`.
- `createBooking(payload)` — `POST /professional-bookings`.
- `getBookingDetail(id)` — `GET /professional-bookings/:id`.
- `cancelBooking(id)` — `POST /professional-bookings/:id/cancel`.
- `getProfessionalListSnapshot()`, `getProfessionalSnapshot()` — snapshot sinkron khusus mock untuk mencegah flash kosong.

UI masuk melalui `useBooking()` pada daftar layanan, detail mitra, dan form booking.

#### `services/gamifikasiService.ts`

- `getProgression(userId)` — `GET /gamification/progression/:userId`.
- `getBadges(userId)` — `GET /gamification/badges/:userId`.
- `getRewards(userId)` — `GET /gamification/rewards/:userId`.
- `claimReward(userId, rewardId)` — `POST /gamification/rewards/:rewardId/claim` dengan `user_id`.
- `getGamificationSnapshot()`, `getRewardsSnapshot()` — snapshot sinkron khusus mock.
- `subscribeToGamification()`, `getGamificationStoreVersion()` — sinkronisasi klaim reward mock.

UI masuk melalui `useGamifikasi()` pada Progression Level, Profil, Mailbox, dan badge level di top bar Dashboard.

#### `services/socketClient.ts`

- `connect()` / `disconnect()` — lifecycle realtime.
- `on(event, listener)` — subscribe dan mengembalikan fungsi unsubscribe.
- `emit(event, payload)` — kirim event generic.
- `onStatusChange()` — subscribe status koneksi.
- `simulateServerEvent()` / `simulateSosStream()` — hanya simulasi mock.
- `SOS_EVENTS` — tiga nama event kontrak SOS.

Dipakai oleh `useSos()` dan `sosService`.

### Hooks

#### `hooks/useAuth.ts`
Mengekspos `user`, `isGuest`, `isLoading`, `error`, serta `login`, `register`, `logout`, `updateUsername`, `clearError`. Digunakan di seluruh permukaan yang membutuhkan identitas atau status Guest.

#### `hooks/useUpload.ts`
Mengekspos `isUploading`, `error`, `errorType`, `uploadPublicPhoto`, `uploadVerificationDocument`, `clearError`. Dipakai oleh Sign Up.

#### `hooks/useGeocode.ts`
Mengekspos `location`, `searchResults`, `status`, `error`, `errorType`, `searchAddress`, `reverseGeocode`, `retry`. Dipakai Dashboard, Peta Infrastruktur, dan Screen B Minta Bantuan.

#### `hooks/useInfrastruktur.ts`
Mengekspos titik/kategori/filter, `status`, `error`, `errorType`, `retry`, `toggleCategory`, `confirmPoint`, `reportNewPoint`, `reportPointChanged`. Dipakai halaman Peta Infrastruktur.

#### `hooks/useBantuan.ts`
Mengekspos relawan, permintaan masuk/aktif, hasil matching, status/error/retry, `findAnotherVolunteer`, CRUD lifecycle bantuan, dan `submitReview`. Dipakai Dashboard, Semua Relawan, flow Minta Bantuan, permintaan masuk, dan panel sesi relawan.

#### `hooks/useSos.ts`
Mengekspos fase/sesi/progres/lokasi relawan, `errorType`, status kirim/aktif, kontrol dialog, `sendSos`, `cancelSos`, dan `refreshStatus`. Dipakai Dashboard; semua kegagalan ditampilkan melalui full-screen alert khusus SOS.

#### `hooks/useBooking.ts`
Mengekspos katalog/detail mitra, booking, filter options, `status`, `error`, `errorType`, `isSubmitting`, `retry`, `createBooking`, `getBookingDetail`, `cancelBooking`. Dipakai tiga halaman Layanan Profesional.

#### `hooks/useGamifikasi.ts`
Mengekspos progression, empat zona, trust score, badge, reward, status/error, dan aksi claim. Dipakai Progression, Profil, Dashboard/top bar, dan `MailboxContext`.

#### `hooks/useLocationPrivacy.ts`
Menyimpan pengaturan privasi lokasi di localStorage (`rangkulmap.profile.location-privacy`). Dipakai Profil. Hook ini masih local-only dan belum memiliki endpoint service.

#### `hooks/useResourceStatus.ts`
Simulator lifecycle loading/error generik berbasis koneksi perangkat dan flag demo. Saat ini dipakai untuk loading peta Dashboard.

#### `hooks/useSimulatedLoading.ts`
Timer loading generik. Saat ini tidak memiliki consumer dan dapat dihapus setelah semua loading menggunakan lifecycle request asli.

---

## 5. Mengaktifkan data backend asli

### Checklist minimum

1. Siapkan file environment deployment:

   ```env
   VITE_APP_ENV=staging
   VITE_API_BASE_URL=https://api-staging.rangkulmap.id/v1
   VITE_API_TIMEOUT_MS=15000
   VITE_SOCKET_URL=https://api-staging.rangkulmap.id
   VITE_SOCKET_PATH=/socket.io
   VITE_ENABLE_REALTIME=true
   VITE_SOS_DISABLED_FOR_TESTING=false
   VITE_AUTH_TOKEN_STORAGE_KEY=rangkulmap.auth.token
   VITE_AUTH_REFRESH_TOKEN_STORAGE_KEY=rangkulmap.auth.refresh-token
   VITE_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
   VITE_USE_MOCK_DATA=false
   VITE_SIMULATE_ERRORS=false
   ```

2. Pastikan seluruh endpoint pada tabel service tersedia di bawah `API_BASE_URL`.
3. Pastikan setiap success response cocok dengan type di folder `types/`. Saat ini `apiClient` mengembalikan body respons langsung sebagai `T`; bila backend memakai envelope seperti `{ data, meta }`, normalisasikan sekali di `handleResponse()` atau sesuaikan live callback service—jangan mengubah page/component.
4. Pastikan body error menyertakan `message`; status HTTP akan dipetakan otomatis oleh `apiClient`.
5. Pastikan login/register mengirim `user`, `access_token`, dan bila digunakan `refresh_token`.
6. Implementasikan gateway Socket.io sesuai bagian 3 dan gunakan tiga nama event kontrak secara persis.
7. Verifikasi CORS untuk origin frontend, header `Authorization`, `Content-Type`, dan `X-Client-App`.
8. Verifikasi upload Cloudinary:
   - endpoint config public mengembalikan `upload_url` dan `unsigned_upload_preset`;
   - endpoint signature private mengembalikan `api_key`, `signature`, `timestamp`, dan `folder`;
   - endpoint confirm menyimpan metadata upload dan mengembalikan `document_id`.
9. Jalankan skenario integrasi utama: login/hydration/logout, peta, request bantuan, SOS realtime, booking+review, progression+claim reward, serta upload dokumen.
10. Setelah staging stabil, jangan pindahkan fetch ke komponen. Bila kontrak berubah, ubah hanya live implementation di service dan type terkait.

### Pola implementasi tiap service

Setiap operasi mengikuti pola berikut:

```ts
export function getSomething(): Promise<Something> {
  return resolveWithMock(
    () => getMockSomething(),
    () => apiClient.get<Something>('/real-endpoint'),
  );
}
```

Ketika `USE_MOCK_DATA=false`, fungsi mock tidak dijalankan dan frontend langsung memakai callback kedua. Dengan demikian, transisi ke backend asli tidak membutuhkan perubahan pada hook maupun UI.

### Validasi sebelum produksi

- `USE_MOCK_DATA=false`
- `SIMULATE_ERRORS=false`
- `SOS_DISABLED_FOR_TESTING=false` setelah pengiriman SOS siap diaktifkan
- `API_BASE_URL` memakai HTTPS dan path versi API yang benar
- refresh/access token policy disepakati
- `SOCKET_URL` dan auth handshake valid
- seluruh endpoint mengembalikan schema sesuai `types/`
- 401 membersihkan session dan mengembalikan user ke Guest
- 404/422/5xx memakai status HTTP yang semestinya
- stream SOS berhenti setelah `cancelled` atau `resolved`
- tidak ada credential Cloudinary secret yang dikirim ke browser
