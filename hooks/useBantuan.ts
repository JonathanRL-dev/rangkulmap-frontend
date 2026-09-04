import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import {
  DEFAULT_BANTUAN_LOCATION,
  acceptRequest as acceptRequestService,
  cancelRequest as cancelRequestService,
  completeRequest as completeRequestService,
  createBantuanRequest as createBantuanRequestService,
  getBantuanStoreVersion,
  getIncomingRequests,
  getNearbyVolunteers,
  subscribeToBantuan } from
'../services/bantuanService';
import { submitReview as submitReviewService } from '../services/reviewService';
import { AppErrorType, createAppError, toAppError } from '../services/apiClient';
import {
  BantuanLocation,
  BantuanRequest,
  CreateBantuanRequestPayload } from
'../types/bantuan';
import { IncomingHelpRequest } from '../types/helpRequest';
import { CreateReviewPayload, Review } from '../types/review';
import { Volunteer } from '../types/volunteer';

type ResourceStatus = 'loading' | 'error' | 'ready';

interface UseBantuanValue {
  volunteers: Volunteer[];
  nearbyVolunteers: Volunteer[];
  incomingRequests: IncomingHelpRequest[];
  currentRequest: BantuanRequest | null;
  matchedVolunteer: Volunteer | null;
  volunteersStatus: ResourceStatus;
  requestsStatus: ResourceStatus;
  matchingStatus: ResourceStatus;
  error: string | null;
  errorType: AppErrorType | null;
  isMutating: boolean;
  retryVolunteers: () => void;
  retryRequests: () => void;
  retryMatching: () => void;
  findAnotherVolunteer: () => Promise<void>;
  createBantuanRequest: (payload: CreateBantuanRequestPayload) => Promise<BantuanRequest>;
  acceptRequest: (requestId: string) => Promise<BantuanRequest>;
  completeRequest: (requestId: string) => Promise<BantuanRequest>;
  cancelRequest: (requestId: string) => Promise<BantuanRequest>;
  submitReview: (payload: CreateReviewPayload) => Promise<Review>;
}

export function useBantuan(location: BantuanLocation = DEFAULT_BANTUAN_LOCATION): UseBantuanValue {
  const { simulateFailures } = useErrorHandling();
  const storeVersion = useSyncExternalStore(subscribeToBantuan, getBantuanStoreVersion, () => 0);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingHelpRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<BantuanRequest | null>(null);
  const [matchedIndex, setMatchedIndex] = useState(0);
  const [volunteersStatus, setVolunteersStatus] = useState<ResourceStatus>('loading');
  const [requestsStatus, setRequestsStatus] = useState<ResourceStatus>('loading');
  const [matchingStatus, setMatchingStatus] = useState<ResourceStatus>('ready');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [volunteersAttempt, setVolunteersAttempt] = useState(0);
  const [requestsAttempt, setRequestsAttempt] = useState(0);
  const failedActions = useRef(new Set<string>());
  const retryMatchingRef = useRef<(() => Promise<void>) | null>(null);

  const captureError = useCallback((reason: unknown, fallbackMessage: string) => {
    const appError = toAppError(reason, fallbackMessage);
    setError(appError.message);
    setErrorType(appError.type);
    return appError;
  }, []);

  useEffect(() => {
    let active = true;
    setVolunteersStatus('loading');
    getNearbyVolunteers(location).
    then((nextVolunteers) => {
      if (!active) return;
      if (simulateFailures && volunteersAttempt === 0) throw createAppError('network');
      setVolunteers(nextVolunteers);
      setVolunteersStatus('ready');
    }).
    catch((reason: unknown) => {
      if (!active) return;
      captureError(reason, 'Daftar relawan gagal dimuat.');
      setVolunteersStatus('error');
    });
    return () => {active = false;};
  }, [captureError, location.address, location.latitude, location.longitude, simulateFailures, volunteersAttempt]);

  useEffect(() => {
    let active = true;
    setRequestsStatus('loading');
    getIncomingRequests().
    then((requests) => {
      if (!active) return;
      if (simulateFailures && requestsAttempt === 0) throw createAppError('network');
      setIncomingRequests(requests);
      setRequestsStatus('ready');
    }).
    catch((reason: unknown) => {
      if (!active) return;
      captureError(reason, 'Permintaan bantuan gagal dimuat.');
      setRequestsStatus('error');
    });
    return () => {active = false;};
  }, [captureError, requestsAttempt, simulateFailures, storeVersion]);

  const maybeFailFirstAction = useCallback((key: string) => {
    if (!simulateFailures || failedActions.current.has(key)) return;
    failedActions.current.add(key);
    throw createAppError('network');
  }, [simulateFailures]);

  const createRequest = useCallback(async (payload: CreateBantuanRequestPayload) => {
    setMatchingStatus('loading');
    setError(null);
    const operation = async () => {
      try {
        maybeFailFirstAction('request:create');
        const request = await createBantuanRequestService(payload);
        setCurrentRequest(request);
        const matchedIndexById = volunteers.findIndex((volunteer) => volunteer.id === request.matched_volunteer_id);
        setMatchedIndex(matchedIndexById >= 0 ? matchedIndexById : 0);
        setMatchingStatus('ready');
        return request;
      } catch (reason) {
        setMatchingStatus('error');
        throw captureError(reason, 'Permintaan bantuan gagal dibuat.');
      }
    };
    retryMatchingRef.current = operation;
    return operation();
  }, [captureError, maybeFailFirstAction, volunteers]);

  const findAnotherVolunteer = useCallback(async () => {
    setMatchingStatus('loading');
    setError(null);
    const operation = async () => {
      try {
        maybeFailFirstAction(`match:next:${matchedIndex}`);
        const nextVolunteers = await getNearbyVolunteers(location);
        setVolunteers(nextVolunteers);
        setMatchedIndex((current) => nextVolunteers.length > 0 ? (current + 1) % nextVolunteers.length : 0);
        setMatchingStatus('ready');
      } catch (reason) {
        setMatchingStatus('error');
        throw captureError(reason, 'Relawan lain gagal dicari.');
      }
    };
    retryMatchingRef.current = operation;
    return operation();
  }, [captureError, location, matchedIndex, maybeFailFirstAction]);

  const mutateRequest = useCallback(async (
  key: string,
  requestId: string,
  operation: (id: string) => Promise<BantuanRequest>) =>
  {
    setIsMutating(true);
    setError(null);
    try {
      maybeFailFirstAction(`${key}:${requestId}`);
      const request = await operation(requestId);
      if (currentRequest?.request_id === requestId) setCurrentRequest(request);
      return request;
    } catch (reason) {
      throw captureError(reason, 'Permintaan bantuan gagal diperbarui.');
    } finally {
      setIsMutating(false);
    }
  }, [captureError, currentRequest?.request_id, maybeFailFirstAction]);

  const matchedVolunteer = volunteers[matchedIndex] ?? null;

  return {
    volunteers,
    nearbyVolunteers: useMemo(() => volunteers.slice(0, 3), [volunteers]),
    incomingRequests,
    currentRequest,
    matchedVolunteer,
    volunteersStatus,
    requestsStatus,
    matchingStatus,
    error,
    errorType,
    isMutating,
    retryVolunteers: useCallback(() => setVolunteersAttempt((current) => current + 1), []),
    retryRequests: useCallback(() => setRequestsAttempt((current) => current + 1), []),
    retryMatching: useCallback(() => {void retryMatchingRef.current?.();}, []),
    findAnotherVolunteer,
    createBantuanRequest: createRequest,
    acceptRequest: useCallback(
      (requestId) => mutateRequest('request:accept', requestId, acceptRequestService),
      [mutateRequest]
    ),
    completeRequest: useCallback(
      (requestId) => mutateRequest('request:complete', requestId, completeRequestService),
      [mutateRequest]
    ),
    cancelRequest: useCallback(
      (requestId) => mutateRequest('request:cancel', requestId, cancelRequestService),
      [mutateRequest]
    ),
    submitReview: useCallback(async (payload) => {
      setIsMutating(true);
      try {
        maybeFailFirstAction(`review:${payload.source_id}`);
        return await submitReviewService(payload);
      } finally {
        setIsMutating(false);
      }
    }, [maybeFailFirstAction])
  };
}