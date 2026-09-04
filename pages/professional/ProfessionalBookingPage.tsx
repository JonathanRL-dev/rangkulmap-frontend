import React, { FormEvent, useMemo, useState } from 'react';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Box, Button, CircularProgress, Container, Divider, Paper, Slider, Stack, TextField, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FieldErrorText } from '../../components/feedback/FieldErrorText';
import { ProfessionalHeader } from '../../components/professional/ProfessionalHeader';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../hooks/useBooking';
import { formatIDR } from '../../utils/currency';

const PLATFORM_FEE = 5000;

export function ProfessionalBookingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{id: string;}>();
  const { user } = useAuth();
  const { professional, isSubmitting: submitting, createBooking } = useBooking({ professionalId: id });
  const { showServiceError } = useErrorHandling();
  const [bookingDate, setBookingDate] = useState('');
  const [duration, setDuration] = useState(2);
  const [notes, setNotes] = useState('');
  const [dateError, setDateError] = useState('');

  const minimumDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  if (!professional) return <Navigate to="/layanan-profesional" replace />;

  const serviceCost = professional.hourlyRate * duration;
  const totalCost = serviceCost + PLATFORM_FEE;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookingDate) {
      setDateError('Pilih tanggal layanan terlebih dahulu.');
      return;
    }
    if (bookingDate < minimumDate) {
      setDateError('Tanggal layanan tidak boleh di masa lalu.');
      return;
    }
    setDateError('');

    try {
      await createBooking({
        client_id: user?.account_id ?? 'RM-GUEST01',
        professional_id: professional.id,
        tanggal: bookingDate,
        durasi: duration,
        catatan: notes,
        biaya: totalCost
      });
      toast.success('Permintaan booking dikirim', {
        description: `${professional.name} akan mengonfirmasi jadwal Anda. Total sementara ${formatIDR(totalCost)}.`
      });
      navigate(`/layanan-profesional/${professional.id}`);
    } catch (reason) {
      const presentation = showServiceError(reason, 'Booking gagal dikirim', 'Jadwal belum tersimpan. Coba konfirmasi ulang.');
      // Validation failures belong inline on the field, never in a toast.
      if (presentation.pattern === 'inline') setDateError(presentation.description);
    }
  };

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <ProfessionalHeader
        title="Pesan Layanan"
        subtitle={professional.name}
        onBack={() => navigate(`/layanan-profesional/${professional.id}`)} />
      

      <Container
        component="form"
        onSubmit={handleSubmit}
        maxWidth="md"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h3" sx={{ mb: 2.5 }}>
              Jadwal pendampingan
            </Typography>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Tanggal layanan"
                type="date"
                value={bookingDate}
                onChange={(event) => {
                  setBookingDate(event.target.value);
                  setDateError('');
                }}
                error={Boolean(dateError)}
                helperText={dateError ? <FieldErrorText message={dateError} /> : undefined}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minimumDate }}
                InputProps={{ startAdornment: <CalendarMonthRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                sx={{ '& .MuiInputBase-root': { minHeight: 56 } }} />
              

              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ScheduleRoundedIcon color="primary" />
                    <Typography id="duration-slider-label" variant="body1" sx={{ fontWeight: 800 }}>
                      Durasi layanan
                    </Typography>
                  </Stack>
                  <Typography variant="h3" color="primary.main">
                    {duration} jam
                  </Typography>
                </Stack>
                <Slider
                  aria-labelledby="duration-slider-label"
                  value={duration}
                  onChange={(_event, value) => setDuration(value as number)}
                  min={1}
                  max={8}
                  step={1}
                  marks={[
                  { value: 1, label: '1 jam' },
                  { value: 4, label: '4 jam' },
                  { value: 8, label: '8 jam' }]
                  }
                  valueLabelDisplay="auto"
                  sx={{ mt: 2, '& .MuiSlider-thumb': { width: 28, height: 28 } }} />
                
              </Box>

              <TextField
                fullWidth
                label="Catatan kebutuhan khusus"
                multiline
                minRows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Jelaskan kondisi, kebutuhan mobilitas, obat, atau alat bantu yang digunakan..."
                inputProps={{ maxLength: 500 }}
                helperText={`${notes.length}/500 karakter · Opsional`} />
              
            </Stack>
          </Paper>

          <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h3" sx={{ mb: 2 }}>
              Ringkasan Biaya
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body1" color="text.secondary">
                  Tarif {duration} jam × {formatIDR(professional.hourlyRate)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatIDR(serviceCost)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body1" color="text.secondary">
                  Biaya platform
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatIDR(PLATFORM_FEE)}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                <Typography variant="h3">Total sementara</Typography>
                <Typography variant="h2">{formatIDR(totalCost)}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Tidak ada biaya tersembunyi. Pembayaran dilakukan setelah jadwal dikonfirmasi oleh mitra.
              </Typography>
            </Stack>
          </Paper>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleRoundedIcon />}
            disabled={submitting}
            sx={{ minHeight: 64, borderRadius: 3 }}>
            
            {submitting ? 'Mengirim permintaan…' : `Konfirmasi Booking · ${formatIDR(totalCost)}`}
          </Button>
        </Stack>
      </Container>
    </Box>);

}