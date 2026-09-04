import React, { FormEvent, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography } from
'@mui/material';

import { FieldErrorText } from '../feedback/FieldErrorText';
import { AuthResult } from '../../types/auth';

interface EditUsernameDialogProps {
  open: boolean;
  currentUsername: string;
  accountId: string;
  onClose: () => void;
  /** Saves only AuthUser.username; never the login email. */
  onSaveUsername: (username: string) => Promise<AuthResult>;
}

export function EditUsernameDialog({
  open,
  currentUsername,
  accountId,
  onClose,
  onSaveUsername
}: EditUsernameDialogProps) {
  const [username, setUsername] = useState(currentUsername);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(currentUsername);
      setErrorMessage('');
    }
  }, [currentUsername, open]);

  const trimmedUsername = username.trim();
  const isUnchanged = trimmedUsername === currentUsername;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedUsername || isUnchanged || saving) return;

    setSaving(true);
    try {
      const result = await onSaveUsername(trimmedUsername);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onClose();
    } catch {
      setErrorMessage('Username belum dapat disimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ component: 'form', onSubmit: handleSubmit, autoComplete: 'off' }}>
      
      <DialogTitle component="div" sx={{ pr: 7 }}>
        <Typography component="h2" variant="h2">
          Edit Username
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ubah nama pengguna publik Anda. Alamat email untuk login tidak ikut berubah.
        </Typography>
        <IconButton
          type="button"
          aria-label="Tutup dialog edit username"
          onClick={onClose}
          disabled={saving}
          sx={{ position: 'absolute', right: 12, top: 12 }}>
          
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <TextField
            autoFocus
            required
            fullWidth
            type="text"
            name="rangkulmap-public-username"
            autoComplete="off"
            label="Username publik"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setErrorMessage('');
            }}
            error={Boolean(errorMessage)}
            InputProps={{
              startAdornment: <InputAdornment position="start">@</InputAdornment>
            }}
            inputProps={{
              maxLength: 24,
              inputMode: 'text',
              spellCheck: false,
              'aria-describedby': 'username-helper'
            }}
            helperText={
            errorMessage ?
            <FieldErrorText message={errorMessage} /> :

            'Bukan alamat email. Gunakan 3–24 karakter: huruf, angka, titik, atau garis bawah.'

            }
            FormHelperTextProps={{ id: 'username-helper' }} />
          

          <TextField
            fullWidth
            disabled
            label="Account ID"
            value={accountId}
            helperText="Account ID bersifat permanen dan tidak dapat diubah." />
          
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button type="button" variant="text" onClick={onClose} disabled={saving}>
          Batal
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          disabled={!trimmedUsername || isUnchanged || saving}>
          
          Simpan Username
        </Button>
      </DialogActions>
    </Dialog>);

}