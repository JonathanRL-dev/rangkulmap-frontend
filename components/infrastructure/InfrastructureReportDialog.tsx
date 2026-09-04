import React, { ChangeEvent, FormEvent, useState } from 'react';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography } from
'@mui/material';

import { FieldErrorText } from '../feedback/FieldErrorText';
import {
  InfrastructureCategory,
  InfrastructureCategoryOption,
  InfrastructureCondition,
  InfrastructureReportFormValues } from
'../../types/infrastructure';

interface ReportFieldErrors {
  photo?: string;
  category?: string;
}

interface InfrastructureReportDialogProps {
  open: boolean;
  categories: InfrastructureCategoryOption[];
  onClose: () => void;
  /** Resolves true when the report and its public photo reached the server. */
  onSubmit: (values: InfrastructureReportFormValues) => Promise<boolean>;
}

export function InfrastructureReportDialog({ open, categories, onClose, onSubmit }: InfrastructureReportDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [category, setCategory] = useState<InfrastructureCategory | ''>('');
  const [condition, setCondition] = useState<InfrastructureCondition>('Baik');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ReportFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files?.[0] ?? null);
    setErrors((current) => ({ ...current, photo: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: ReportFieldErrors = {
      photo: photo ? undefined : 'Foto lokasi wajib diunggah.',
      category: category ? undefined : 'Pilih kategori fasilitas terlebih dahulu.'
    };
    setErrors(nextErrors);
    if (nextErrors.photo || nextErrors.category || !photo || !category) return;

    setSubmitting(true);
    const delivered = await onSubmit({ photo, category, condition, notes });
    setSubmitting(false);
    if (!delivered) return;

    setPhoto(null);
    setCategory('');
    setCondition('Baik');
    setNotes('');
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      
      <DialogTitle component="div" sx={{ pr: 7 }}>
        <Typography component="h2" variant="h2">
          Laporkan Titik Baru
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bantu komunitas menemukan fasilitas yang lebih inklusif.
        </Typography>
        <IconButton
          type="button"
          aria-label="Tutup formulir laporan"
          onClick={onClose}
          disabled={submitting}
          sx={{ position: 'absolute', right: 12, top: 12 }}>
          
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Button
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<AddAPhotoRoundedIcon />}
              sx={{
                minHeight: 72,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: errors.photo ? 'error.main' : undefined,
                color: errors.photo ? 'error.main' : undefined
              }}>
              
              {photo?.name || 'Unggah Foto Lokasi'}
              <Box component="input" type="file" accept="image/*" hidden onChange={handleFileChange} />
            </Button>
            {errors.photo ?
            <FormHelperText component="div" error sx={{ mt: 0.75, mx: 0 }}>
                <FieldErrorText message={errors.photo} />
              </FormHelperText> :

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                Foto wajib diunggah. Gunakan foto terbaru dan terlihat jelas.
              </Typography>
            }
          </Box>

          <FormControl fullWidth required error={Boolean(errors.category)}>
            <InputLabel id="report-category-label">Kategori</InputLabel>
            <Select
              labelId="report-category-label"
              value={category}
              label="Kategori"
              onChange={(event) => {
                setCategory(event.target.value as InfrastructureCategory);
                setErrors((current) => ({ ...current, category: undefined }));
              }}
              sx={{ minHeight: 56 }}>
              
              {categories.map((option) =>
              <MenuItem key={option.id} value={option.id} sx={{ minHeight: 48 }}>
                  {option.label}
                </MenuItem>
              )}
            </Select>
            {errors.category &&
            <FormHelperText component="div">
                <FieldErrorText message={errors.category} />
              </FormHelperText>
            }
          </FormControl>

          <FormControl>
            <FormLabel id="condition-radio-label" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Kondisi fasilitas
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="condition-radio-label"
              value={condition}
              onChange={(event) => setCondition(event.target.value as InfrastructureCondition)}>
              
              <FormControlLabel value="Baik" control={<Radio />} label="Baik" sx={{ minHeight: 48 }} />
              <FormControlLabel value="Rusak" control={<Radio />} label="Rusak" sx={{ minHeight: 48 }} />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Catatan"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={4}
            placeholder="Jelaskan akses, hambatan, atau perubahan kondisi..."
            inputProps={{ maxLength: 400 }}
            helperText={`${notes.length}/400 karakter`} />
          
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button type="button" variant="text" onClick={onClose} disabled={submitting}>
          Batal
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}>
          
          {submitting ? 'Mengirim…' : 'Kirim Laporan'}
        </Button>
      </DialogActions>
    </Dialog>);

}