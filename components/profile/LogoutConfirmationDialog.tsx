import React from 'react';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle } from
'@mui/material';

interface LogoutConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmationDialog({ open, onClose, onConfirm }: LogoutConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="logout-dialog-title">
      <DialogTitle id="logout-dialog-title">Yakin ingin keluar?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Anda akan kembali ke Dashboard sebagai Guest. Akun dapat digunakan kembali dengan masuk ulang.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button variant="text" color="inherit" onClick={onClose} autoFocus>
          Batal
        </Button>
        <Button variant="contained" color="primary" startIcon={<LogoutRoundedIcon />} onClick={onConfirm}>
          Ya, Keluar
        </Button>
      </DialogActions>
    </Dialog>);

}