import React, { FormEvent, useState } from 'react';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography } from
'@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { AuthShell } from '../../components/auth/AuthShell';
import { FieldErrorText } from '../../components/feedback/FieldErrorText';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useAuth } from '../../hooks/useAuth';

interface SignInFieldErrors {
  identifier?: string;
  password?: string;
}

export function SignInPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showErrorToast } = useErrorHandling();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
  const [recoveryNotice, setRecoveryNotice] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecoveryNotice(false);

    const nextErrors: SignInFieldErrors = {
      identifier: identifier.trim() ? undefined : 'Email atau nomor HP wajib diisi.',
      password: password ? undefined : 'Password wajib diisi.'
    };
    setFieldErrors(nextErrors);
    if (nextErrors.identifier || nextErrors.password) return;

    const result = await login(identifier, password);
    if (!result.success) {
      showErrorToast('Gagal masuk', result.message);
      setFieldErrors((current) => ({
        ...current,
        password: 'Periksa kembali email/nomor HP dan password Anda.'
      }));
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthShell
      activeTab="signin"
      title="Selamat datang kembali"
      subtitle="Masuk dengan email, nomor HP, atau username yang sudah Anda daftarkan.">
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {recoveryNotice &&
          <Alert severity="info" onClose={() => setRecoveryNotice(false)}>
              Pemulihan password akan tersedia setelah verifikasi akun tersambung.
            </Alert>
          }

          <TextField
            required
            fullWidth
            autoFocus
            autoComplete="username"
            label="Email atau nomor HP"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setFieldErrors((current) => ({ ...current, identifier: undefined }));
            }}
            error={Boolean(fieldErrors.identifier)}
            helperText={fieldErrors.identifier ? <FieldErrorText message={fieldErrors.identifier} /> : undefined}
            InputProps={{
              startAdornment:
              <InputAdornment position="start">
                  <EmailRoundedIcon color="action" />
                </InputAdornment>

            }} />
          
          <TextField
            required
            fullWidth
            autoComplete="current-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password ? <FieldErrorText message={fieldErrors.password} /> : undefined}
            InputProps={{
              startAdornment:
              <InputAdornment position="start">
                  <LockRoundedIcon color="action" />
                </InputAdornment>,

              endAdornment:
              <InputAdornment position="end">
                  <IconButton
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setShowPassword((current) => !current)}
                  edge="end">
                  
                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </IconButton>
                </InputAdornment>

            }} />
          

          <Box sx={{ textAlign: 'right' }}>
            <Link component="button" type="button" variant="body1" onClick={() => setRecoveryNotice(true)}>
              Lupa password?
            </Link>
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={isLoading}>
            Masuk
          </Button>

          <Typography variant="body1" color="text.secondary" textAlign="center">
            Belum punya akun?{' '}
            <Link component={RouterLink} to="/daftar" sx={{ fontWeight: 700 }}>
              Daftar di sini
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthShell>);

}