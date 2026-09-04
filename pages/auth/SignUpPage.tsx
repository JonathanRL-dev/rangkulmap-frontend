import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography } from
'@mui/material';
import { useNavigate } from 'react-router-dom';

import { AuthShell } from '../../components/auth/AuthShell';
import {
  ProfessionalFieldErrors,
  ProfessionalRegistrationFields } from
'../../components/auth/ProfessionalRegistrationFields';
import { SignUpRoleSelection } from '../../components/auth/SignUpRoleSelection';
import { FieldErrorText } from '../../components/feedback/FieldErrorText';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { assistanceNeeds } from '../../data/authOptions';
import { useAuth } from '../../hooks/useAuth';
import { useUpload } from '../../hooks/useUpload';
import { UserRole } from '../../types/auth';

interface SignUpFieldErrors extends ProfessionalFieldErrors {
  name?: string;
  emergencyContact?: string;
  ktp?: string;
  selfie?: string;
  username?: string;
  identifier?: string;
  password?: string;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { uploadVerificationDocument } = useUpload();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [domicile, setDomicile] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showErrorToast, showServiceError } = useErrorHandling();

  const roleLabel = role === 'volunteer' ? 'Relawan' : role === 'professional' ? 'Mitra Profesional' : 'Pencari Bantuan';

  const validateAccountFields = (): SignUpFieldErrors => {
    const nextErrors: SignUpFieldErrors = {
      name: name.trim().length >= 2 ? undefined : 'Nama lengkap minimal 2 karakter.',
      username: username.trim().length >= 3 ? undefined : 'Username minimal 3 karakter.',
      identifier: identifier.trim().length >= 5 ? undefined : 'Masukkan email atau nomor HP yang valid.',
      password: password.length >= 8 ? undefined : 'Password minimal 8 karakter.'
    };

    if (role === 'seeker') {
      nextErrors.emergencyContact =
      emergencyContact.trim().length >= 5 ? undefined : 'Isi nama dan nomor HP kontak darurat.';
    } else if (role === 'volunteer') {
      nextErrors.domicile = domicile.trim().length >= 2 ? undefined : 'Area domisili wajib diisi.';
      nextErrors.ktp = ktpFile ? undefined : 'Foto KTP wajib diunggah.';
      nextErrors.selfie = selfieFile ? undefined : 'Swafoto wajib diunggah.';
    } else if (role === 'professional') {
      nextErrors.licenseNumber = licenseNumber.trim() ? undefined : 'Nomor lisensi atau STR wajib diisi.';
      nextErrors.specialization = specialization.trim() ? undefined : 'Spesialisasi wajib diisi.';
      nextErrors.hourlyRate = Number(hourlyRate) > 0 ? undefined : 'Tarif per jam harus lebih dari Rp0.';
      nextErrors.domicile = domicile.trim().length >= 2 ? undefined : 'Area domisili wajib diisi.';
      nextErrors.certification = certificationFile ? undefined : 'Dokumen sertifikasi atau STR wajib diunggah.';
    }

    return nextErrors;
  };

  const clearFieldError = (field: keyof SignUpFieldErrors) =>
  setFieldErrors((current) => ({ ...current, [field]: undefined }));

  const handleNeedsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setNeeds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleKtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKtpFile(event.target.files?.[0] ?? null);
    clearFieldError('ktp');
  };

  const handleSelfieChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0] ?? null;
    clearFieldError('selfie');
    if (file && file.size > 2 * 1024 * 1024) {
      setFieldErrors((current) => ({ ...current, selfie: 'Ukuran swafoto maksimal 2 MB.' }));
      setSelfieFile(null);
      input.value = '';
      return;
    }
    setSelfieFile(file);
  };

  const handleCertificationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCertificationFile(event.target.files?.[0] ?? null);
    clearFieldError('certification');
  };

  useEffect(() => {
    if (!success) return;
    const redirectTimer = window.setTimeout(() => navigate('/dashboard', { replace: true }), 1400);
    return () => window.clearTimeout(redirectTimer);
  }, [navigate, success]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 1) {
      if (role) setStep(2);
      return;
    }
    if (!role) return;

    const nextErrors = validateAccountFields();
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const [ktpUpload, selfieVerification, certificationUpload] = await Promise.all([
      role === 'volunteer' && ktpFile ? uploadVerificationDocument(ktpFile) : null,
      role === 'volunteer' && selfieFile ? uploadVerificationDocument(selfieFile) : null,
      role === 'professional' && certificationFile ? uploadVerificationDocument(certificationFile) : null]
      );

      const result = await register({
        display_name: name,
        role,
        username,
        email: identifier,
        password,
        needs: role === 'seeker' && needs.length > 0 ? needs : undefined,
        emergency_contact: role === 'seeker' ? emergencyContact : undefined,
        domicile: role === 'volunteer' || role === 'professional' ? domicile : undefined,
        license_number: role === 'professional' ? licenseNumber : undefined,
        specialization: role === 'professional' ? specialization : undefined,
        hourly_rate: role === 'professional' ? Number(hourlyRate) : undefined,
        verification_documents: role === 'volunteer' ?
        {
          ktp_document_id: ktpUpload?.document_id,
          selfie_document_id: selfieVerification?.document_id
        } :
        role === 'professional' ?
        { certification_document_id: certificationUpload?.document_id } :
        undefined
      });
      if (!result.success) {
        showErrorToast('Akun gagal dibuat', result.message);
        return;
      }

      setSuccess(true);
    } catch (reason) {
      const presentation = showServiceError(reason, 'Pendaftaran gagal terkirim');
      // Validation problems stay inline on the form instead of a toast.
      if (presentation.pattern === 'inline') {
        setFieldErrors((current) => ({ ...current, identifier: presentation.description }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      activeTab="signup"
      title={step === 1 ? 'Daftar ke RangkulMap' : `Lengkapi akun ${roleLabel}`}
      subtitle={step === 1 ? 'Pilih cara Anda ingin menggunakan RangkulMap.' : 'Isi data berikut agar pengalaman Anda lebih aman dan personal.'}>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Langkah {step} dari 2
              </Typography>
              <Typography variant="caption" color="primary.main">
                {step === 1 ? 'Pilih peran' : 'Data akun'}
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={step * 50} aria-label={`Progres pendaftaran langkah ${step} dari 2`} />
          </Box>

          {success &&
          <Alert severity="success" icon={<CheckCircleRoundedIcon />}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Akun berhasil dibuat
              </Typography>
              <Typography variant="caption">Mengarahkan Anda ke Dashboard {roleLabel}…</Typography>
            </Alert>
          }

          {step === 1 ?
          <SignUpRoleSelection value={role} onChange={setRole} /> :

          <Stack spacing={2.5}>
              <Chip
              icon={role === 'volunteer' ?
              <VolunteerActivismRoundedIcon /> :
              role === 'professional' ?
              <MedicalServicesRoundedIcon /> :
              <FavoriteRoundedIcon />}
              label={roleLabel}
              color={role === 'volunteer' ? 'warning' : role === 'professional' ? 'success' : 'primary'}
              sx={{ alignSelf: 'flex-start' }} />
            

              <TextField
              required
              fullWidth
              label="Nama lengkap"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError('name');
              }}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name ? <FieldErrorText message={fieldErrors.name} /> : undefined} />
            

              {role === 'seeker' ?
            <>
                  <FormControl fullWidth>
                    <InputLabel id="needs-label">Jenis kebutuhan (opsional)</InputLabel>
                    <Select
                  multiple
                  labelId="needs-label"
                  label="Jenis kebutuhan (opsional)"
                  value={needs}
                  onChange={handleNeedsChange}
                  renderValue={(selected) => selected.join(', ')}>
                  
                      {assistanceNeeds.map((need) =>
                  <MenuItem key={need} value={need}>
                          <Checkbox checked={needs.includes(need)} />
                          <ListItemText primary={need} />
                        </MenuItem>
                  )}
                    </Select>
                  </FormControl>
                  <TextField
                required
                fullWidth
                label="Kontak darurat"
                placeholder="Nama dan nomor HP"
                value={emergencyContact}
                onChange={(event) => {
                  setEmergencyContact(event.target.value);
                  clearFieldError('emergencyContact');
                }}
                error={Boolean(fieldErrors.emergencyContact)}
                helperText={
                fieldErrors.emergencyContact ?
                <FieldErrorText message={fieldErrors.emergencyContact} /> :

                'Kontak yang dapat dihubungi saat Anda membutuhkan bantuan.'

                } />
              
                </> :
            role === 'volunteer' ?
            <>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadFileRoundedIcon />}
                    sx={{
                      minHeight: 72,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: fieldErrors.ktp ? 'error.main' : undefined,
                      color: fieldErrors.ktp ? 'error.main' : undefined
                    }}>
                    
                        {ktpFile?.name || 'Unggah Foto KTP'}
                        <Box component="input" type="file" accept="image/*" hidden onChange={handleKtpChange} />
                      </Button>
                      {fieldErrors.ktp ?
                  <FormHelperText component="div" error sx={{ mt: 0.75, mx: 0 }}>
                          <FieldErrorText message={fieldErrors.ktp} />
                        </FormHelperText> :

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                          Wajib untuk verifikasi identitas.
                        </Typography>
                  }
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<AddAPhotoRoundedIcon />}
                    sx={{
                      minHeight: 72,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: fieldErrors.selfie ? 'error.main' : undefined,
                      color: fieldErrors.selfie ? 'error.main' : undefined
                    }}>
                    
                        {selfieFile?.name || 'Unggah Swafoto'}
                        <Box component="input" type="file" accept="image/*" hidden onChange={handleSelfieChange} />
                      </Button>
                      {fieldErrors.selfie ?
                  <FormHelperText component="div" error sx={{ mt: 0.75, mx: 0 }}>
                          <FieldErrorText message={fieldErrors.selfie} />
                        </FormHelperText> :

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                          Wajah terlihat jelas, maksimal 2 MB.
                        </Typography>
                  }
                    </Box>
                  </Stack>
                  <TextField
                required
                fullWidth
                label="Area domisili"
                value={domicile}
                onChange={(event) => {
                  setDomicile(event.target.value);
                  clearFieldError('domicile');
                }}
                error={Boolean(fieldErrors.domicile)}
                helperText={fieldErrors.domicile ? <FieldErrorText message={fieldErrors.domicile} /> : undefined} />
              
                </> :

            <ProfessionalRegistrationFields
              licenseNumber={licenseNumber}
              specialization={specialization}
              hourlyRate={hourlyRate}
              domicile={domicile}
              certificationFileName={certificationFile?.name ?? ''}
              errors={fieldErrors}
              onLicenseNumberChange={(value) => {setLicenseNumber(value);clearFieldError('licenseNumber');}}
              onSpecializationChange={(value) => {setSpecialization(value);clearFieldError('specialization');}}
              onHourlyRateChange={(value) => {setHourlyRate(value);clearFieldError('hourlyRate');}}
              onDomicileChange={(value) => {setDomicile(value);clearFieldError('domicile');}}
              onCertificationChange={handleCertificationChange} />

            }

              <TextField
              required
              fullWidth
              label="Username"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                clearFieldError('username');
              }}
              error={Boolean(fieldErrors.username)}
              helperText={
              fieldErrors.username ? <FieldErrorText message={fieldErrors.username} /> : 'Minimal 3 karakter.'
              } />
            
              <TextField
              required
              fullWidth
              label="Email atau nomor HP"
              autoComplete="email"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                clearFieldError('identifier');
              }}
              error={Boolean(fieldErrors.identifier)}
              helperText={fieldErrors.identifier ? <FieldErrorText message={fieldErrors.identifier} /> : undefined} />
            
              <TextField
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError('password');
              }}
              error={Boolean(fieldErrors.password)}
              helperText={
              fieldErrors.password ? <FieldErrorText message={fieldErrors.password} /> : 'Minimal 8 karakter.'
              } />
            
            </Stack>
          }

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            {step === 2 ?
            <Button
              type="button"
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setStep(1)}
              disabled={success || submitting}>
              
                Ganti peran
              </Button> :

            <Box />
            }
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={step === 1 ? !role : success || submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ minWidth: { sm: 180 } }}>
              
              {step === 1 ? 'Lanjutkan' : submitting ? 'Menyimpan…' : 'Buat Akun'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </AuthShell>);

}