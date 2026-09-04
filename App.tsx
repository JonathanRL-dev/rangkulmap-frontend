import React, { useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import { ErrorHandlingProvider } from './contexts/ErrorHandlingContext';
import { MailboxProvider } from './contexts/MailboxContext';
import { VolunteerSessionProvider } from './contexts/VolunteerSessionContext';
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage';
import { AllNearbyVolunteersPage } from './pages/AllNearbyVolunteersPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { HelpRequestFlow } from './pages/helpRequest/HelpRequestFlow';
import { PetaInfrastrukturInklusif } from './pages/PetaInfrastrukturInklusif';
import { ProfessionalBookingPage } from './pages/professional/ProfessionalBookingPage';
import { ProfessionalDetailPage } from './pages/professional/ProfessionalDetailPage';
import { ProfessionalServicesPage } from './pages/professional/ProfessionalServicesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressionLevelPage } from './pages/ProgressionLevelPage';
import { SeekerHomeDashboard } from './pages/SeekerHomeDashboard';
import { IncomingRequestsPage } from './pages/volunteer/IncomingRequestsPage';
import { createAppTheme } from './theme/createAppTheme';

interface AppProps {
  /** Exercises every failure path: map, GPS, list loading, submits, and SOS. */
  simulateNetworkErrors?: boolean;
  /** Makes ~10% of all service calls fail at random, to spot-check error surfaces. */
  simulateRandomServiceErrors?: boolean;
}

export function App({
  simulateNetworkErrors = false,
  simulateRandomServiceErrors = false
}: AppProps) {
  return (
    <AccessibilityProvider>
      <VolunteerSessionProvider>
        <RangkulMapExperience
          simulateNetworkErrors={simulateNetworkErrors}
          simulateRandomServiceErrors={simulateRandomServiceErrors} />
        
      </VolunteerSessionProvider>
    </AccessibilityProvider>);

}

function RangkulMapExperience({
  simulateNetworkErrors,
  simulateRandomServiceErrors



}: {simulateNetworkErrors: boolean;simulateRandomServiceErrors: boolean;}) {
  const { resolvedMode, highContrast, fontScale } = useAccessibility();
  const theme = useMemo(
    () => createAppTheme(resolvedMode, highContrast, fontScale),
    [resolvedMode, highContrast, fontScale]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorHandlingProvider
        simulateFailures={simulateNetworkErrors}
        simulateRandomServiceErrors={simulateRandomServiceErrors}>
        
        <MailboxProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/masuk" element={<SignInPage />} />
            <Route path="/daftar" element={<SignUpPage />} />
            <Route path="/pengaturan" element={<AccessibilitySettingsPage />} />
            <Route path="/infrastruktur" element={<PetaInfrastrukturInklusif />} />
            <Route path="/dashboard" element={<SeekerHomeDashboard />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/permintaan-masuk" element={<IncomingRequestsPage />} />
            <Route path="/progression-level" element={<ProgressionLevelPage />} />
            <Route path="/relawan-terdekat" element={<AllNearbyVolunteersPage />} />
            <Route path="/minta-bantuan/*" element={<HelpRequestFlow />} />
            <Route path="/bantuan-relawan/*" element={<HelpRequestFlow perspective="volunteer" />} />
            <Route path="/layanan-profesional" element={<ProfessionalServicesPage />} />
            <Route path="/layanan-profesional/:id" element={<ProfessionalDetailPage />} />
            <Route path="/layanan-profesional/:id/pesan" element={<ProfessionalBookingPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </MailboxProvider>
      </ErrorHandlingProvider>
      <Toaster
        position="top-center"
        richColors
        theme={resolvedMode}
        toastOptions={{
          style: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: '14px'
          }
        }} />
      
    </ThemeProvider>);

}