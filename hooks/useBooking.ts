import { useCallback, useEffect, useRef, useState } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import { AppErrorType, createAppError, toAppError } from '../services/apiClient';
import {
  PROFESSIONAL_LOCATIONS,
  PROFESSIONAL_SERVICE_TYPES,
  ProfessionalFilters,
  cancelBooking as cancelBookingService,
  createBooking as createBookingService,
  getBookingDetail as getBookingDetailService,
  getProfessionalDetail,
  getProfessionalListSnapshot,
  getProfessionalSnapshot,
  getProfessionals } from
'../services/bookingService';
import {
  CreateProfessionalBookingPayload,
  ProfessionalBooking } from
'../types/booking';
import { Professional, ServiceTypeOption } from '../types/professional';

export type BookingResourceStatus = 'loading' | 'error' | 'ready';

interface UseBookingOptions {
  filters?: ProfessionalFilters;
  professionalId?: string;
}

interface UseBookingValue {
  professionals: Professional[];
  professional: Professional | null;
  booking: ProfessionalBooking | null;
  serviceTypeOptions: ServiceTypeOption[];
  serviceLocations: string[];
  status: BookingResourceStatus;
  error: string | null;
  errorType: AppErrorType | null;
  isSubmitting: boolean;
  retry: () => void;
  createBooking: (payload: CreateProfessionalBookingPayload) => Promise<ProfessionalBooking>;
  getBookingDetail: (id: string) => Promise<ProfessionalBooking>;
  cancelBooking: (id: string) => Promise<ProfessionalBooking>;
}

export function useBooking(options: UseBookingOptions = {}): UseBookingValue {
  const { filters, professionalId } = options;
  const { simulateFailures } = useErrorHandling();
  const [professionals, setProfessionals] = useState<Professional[]>(() => getProfessionalListSnapshot(filters));
  const [professional, setProfessional] = useState<Professional | null>(() => getProfessionalSnapshot(professionalId));
  const [booking, setBooking] = useState<ProfessionalBooking | null>(null);
  const [status, setStatus] = useState<BookingResourceStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const failedActions = useRef(new Set<string>());

  const captureError = useCallback((reason: unknown, fallbackMessage: string) => {
    const appError = toAppError(reason, fallbackMessage);
    setError(appError.message);
    setErrorType(appError.type);
    return appError;
  }, []);

  const serviceType = filters?.serviceType ?? 'all';
  const location = filters?.location ?? 'all';
  const availableDate = filters?.availableDate ?? '';

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    const request = professionalId ?
    getProfessionalDetail(professionalId).then((result) => {
      if (active) setProfessional(result);
    }) :
    getProfessionals({ serviceType, location, availableDate }).then((result) => {
      if (active) setProfessionals(result);
    });

    request.
    then(() => {
      if (!active) return;
      if (simulateFailures && attempt === 0) throw createAppError('network');
      setStatus('ready');
    }).
    catch((reason: unknown) => {
      if (!active) return;
      captureError(reason, 'Data layanan profesional gagal dimuat.');
      setStatus('error');
    });

    return () => {active = false;};
  }, [attempt, availableDate, captureError, location, professionalId, serviceType, simulateFailures]);

  const maybeFailFirstAction = useCallback((key: string) => {
    if (!simulateFailures || failedActions.current.has(key)) return;
    failedActions.current.add(key);
    throw createAppError('network');
  }, [simulateFailures]);

  const createBooking = useCallback(async (payload: CreateProfessionalBookingPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      maybeFailFirstAction(`booking:create:${payload.professional_id}`);
      const result = await createBookingService(payload);
      setBooking(result);
      return result;
    } catch (reason) {
      throw captureError(reason, 'Booking gagal dibuat.');
    } finally {
      setIsSubmitting(false);
    }
  }, [captureError, maybeFailFirstAction]);

  const getBookingDetail = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await getBookingDetailService(id);
      setBooking(result);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      maybeFailFirstAction(`booking:cancel:${id}`);
      const result = await cancelBookingService(id);
      setBooking(result);
      return result;
    } catch (reason) {
      throw captureError(reason, 'Booking gagal dibatalkan.');
    } finally {
      setIsSubmitting(false);
    }
  }, [captureError, maybeFailFirstAction]);

  return {
    professionals,
    professional,
    booking,
    serviceTypeOptions: PROFESSIONAL_SERVICE_TYPES,
    serviceLocations: PROFESSIONAL_LOCATIONS,
    status,
    error,
    errorType,
    isSubmitting,
    retry: useCallback(() => setAttempt((current) => current + 1), []),
    createBooking,
    getBookingDetail,
    cancelBooking
  };
}