import { useCallback, useEffect, useMemo, useState } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import {
  reverseGeocode as reverseGeocodeService,
  searchAddress as searchAddressService } from
'../services/geocodeService';
import { DEFAULT_MAP_COORDINATES } from '../services/infrastrukturService';
import { AppErrorType, createAppError, toAppError } from '../services/apiClient';
import { GeocodeResult } from '../types/geocode';
import { MapPinPosition } from '../types/helpRequest';

type GeocodeStatus = 'loading' | 'error' | 'ready';

interface UseGeocodeValue {
  location: GeocodeResult | null;
  searchResults: GeocodeResult[];
  status: GeocodeStatus;
  error: string | null;
  errorType: AppErrorType | null;
  searchAddress: (query: string) => Promise<GeocodeResult[]>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<GeocodeResult | null>;
  retry: () => void;
}

function coordinatesFromPin(pinPosition?: MapPinPosition): {latitude: number;longitude: number;} {
  if (!pinPosition) return DEFAULT_MAP_COORDINATES;
  return {
    latitude: DEFAULT_MAP_COORDINATES.latitude - pinPosition.y * 0.00001,
    longitude: DEFAULT_MAP_COORDINATES.longitude + pinPosition.x * 0.00001
  };
}

export function useGeocode(pinPosition?: MapPinPosition, simulateResourceError = false): UseGeocodeValue {
  const { simulateFailures } = useErrorHandling();
  const coordinates = useMemo(
    () => coordinatesFromPin(pinPosition),
    [pinPosition?.x, pinPosition?.y]
  );
  const [location, setLocation] = useState<GeocodeResult | null>(null);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<GeocodeStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    const timer = window.setTimeout(() => {
      reverseGeocodeService(coordinates.latitude, coordinates.longitude).
      then((response) => {
        if (!active) return;
        if (simulateResourceError && simulateFailures && attempt === 0) throw createAppError('network');
        setLocation(response.data);
        setStatus('ready');
      }).
      catch((reason: unknown) => {
        if (!active) return;
        const appError = toAppError(reason, 'Alamat lokasi gagal dimuat.');
        setError(appError.message);
        setErrorType(appError.type);
        setStatus('error');
      });
    }, pinPosition ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [attempt, coordinates.latitude, coordinates.longitude, pinPosition, simulateFailures, simulateResourceError]);

  const searchAddress = useCallback(async (query: string) => {
    const response = await searchAddressService(query);
    setSearchResults(response.data);
    return response.data;
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const response = await reverseGeocodeService(latitude, longitude);
      setLocation(response.data);
      return response.data;
    } catch (reason) {
      const appError = toAppError(reason, 'Alamat lokasi gagal dimuat.');
      setError(appError.message);
      setErrorType(appError.type);
      return null;
    }
  }, []);

  return {
    location,
    searchResults,
    status,
    error,
    errorType,
    searchAddress,
    reverseGeocode,
    retry: useCallback(() => setAttempt((current) => current + 1), [])
  };
}