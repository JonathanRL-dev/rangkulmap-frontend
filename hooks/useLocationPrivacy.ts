import { useEffect, useState } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import { LocationPrivacySettings } from '../types/profile';

const STORAGE_KEY = 'rangkulmap.profile.location-privacy';

const defaultSettings: LocationPrivacySettings = {
  shareWhileRequesting: true,
  precision: 'exact',
  visibleInNearbyList: true,
  keepLocationHistory: false
};

function readSettings(): LocationPrivacySettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? { ...defaultSettings, ...(JSON.parse(value) as Partial<LocationPrivacySettings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function useLocationPrivacy() {
  const { showErrorToast } = useErrorHandling();
  const [settings, setSettings] = useState<LocationPrivacySettings>(readSettings);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      showErrorToast('Pengaturan privasi tidak tersimpan', 'Pilihan tetap aktif sementara. Coba lagi setelah penyimpanan perangkat tersedia.');
    }
  }, [settings, showErrorToast]);

  const updateSetting = <Key extends keyof LocationPrivacySettings,>(
  key: Key,
  value: LocationPrivacySettings[Key]) =>
  {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return { settings, updateSetting };
}