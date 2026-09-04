import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import {
  DEFAULT_INFRASTRUCTURE_BOUNDS,
  DEFAULT_MAP_COORDINATES,
  confirmPoint,
  getInfrastructureCategories,
  getPointsInBounds,
  reportNewPoint,
  reportPointChanged } from
'../services/infrastrukturService';
import {
  InfrastructureBounds,
  InfrastructureCategory,
  InfrastructureCategoryOption,
  InfrastructurePoint,
  InfrastructureReportFormValues } from
'../types/infrastructure';
import { GeoCoordinates } from '../types/geocode';
import { AppErrorType, createAppError, toAppError } from '../services/apiClient';

export type InfrastrukturStatus = 'loading' | 'error' | 'ready';

interface UseInfrastrukturValue {
  points: InfrastructurePoint[];
  visiblePoints: InfrastructurePoint[];
  categories: InfrastructureCategoryOption[];
  activeCategories: Set<InfrastructureCategory>;
  status: InfrastrukturStatus;
  error: string | null;
  errorType: AppErrorType | null;
  confirmingPointId: string | null;
  retry: () => void;
  toggleCategory: (category: InfrastructureCategory) => void;
  confirmPoint: (id: string) => Promise<void>;
  reportNewPoint: (values: InfrastructureReportFormValues) => Promise<void>;
  reportPointChanged: (id: string) => Promise<void>;
}

export function useInfrastruktur(
reportCoordinates: GeoCoordinates = DEFAULT_MAP_COORDINATES,
bounds: InfrastructureBounds = DEFAULT_INFRASTRUCTURE_BOUNDS)
: UseInfrastrukturValue {
  const { simulateFailures } = useErrorHandling();
  const [points, setPoints] = useState<InfrastructurePoint[]>([]);
  const [categories, setCategories] = useState<InfrastructureCategoryOption[]>([]);
  const [activeCategories, setActiveCategories] = useState<Set<InfrastructureCategory>>(new Set());
  const [status, setStatus] = useState<InfrastrukturStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [confirmingPointId, setConfirmingPointId] = useState<string | null>(null);
  const failedActions = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    Promise.all([getPointsInBounds(bounds), getInfrastructureCategories()]).
    then(([nextPoints, nextCategories]) => {
      if (!active) return;
      if (simulateFailures && retryCount === 0) throw createAppError('network');
      setPoints(nextPoints);
      setCategories(nextCategories);
      setActiveCategories((current) => current.size > 0 ?
      current :
      new Set(nextCategories.map((category) => category.id)));
      setStatus('ready');
    }).
    catch((reason: unknown) => {
      if (!active) return;
      const appError = toAppError(reason, 'Peta infrastruktur gagal dimuat.');
      setError(appError.message);
      setErrorType(appError.type);
      setStatus('error');
    });

    return () => {active = false;};
  }, [bounds.east, bounds.north, bounds.south, bounds.west, retryCount, simulateFailures]);

  const maybeFailFirstAction = useCallback((key: string) => {
    if (!simulateFailures || failedActions.current.has(key)) return;
    failedActions.current.add(key);
    throw createAppError('network');
  }, [simulateFailures]);

  const confirm = useCallback(async (id: string) => {
    setConfirmingPointId(id);
    try {
      maybeFailFirstAction(`confirm:${id}`);
      const updatedPoint = await confirmPoint(id);
      setPoints((current) => current.map((point) => point.id === id ? updatedPoint : point));
    } finally {
      setConfirmingPointId(null);
    }
  }, [maybeFailFirstAction]);

  const submitNewPoint = useCallback(async (values: InfrastructureReportFormValues) => {
    maybeFailFirstAction('report:new');
    await reportNewPoint({
      ...values,
      latitude: reportCoordinates.latitude,
      longitude: reportCoordinates.longitude
    });
  }, [maybeFailFirstAction, reportCoordinates.latitude, reportCoordinates.longitude]);

  const submitPointChanged = useCallback(async (id: string) => {
    maybeFailFirstAction(`changed:${id}`);
    await reportPointChanged(id);
  }, [maybeFailFirstAction]);

  const visiblePoints = useMemo(
    () => points.filter((point) => activeCategories.has(point.category)),
    [activeCategories, points]
  );

  return {
    points,
    visiblePoints,
    categories,
    activeCategories,
    status,
    error,
    errorType,
    confirmingPointId,
    retry: useCallback(() => setRetryCount((current) => current + 1), []),
    toggleCategory: useCallback((category: InfrastructureCategory) => {
      setActiveCategories((current) => {
        const next = new Set(current);
        if (next.has(category)) next.delete(category);else
        next.add(category);
        return next;
      });
    }, []),
    confirmPoint: confirm,
    reportNewPoint: submitNewPoint,
    reportPointChanged: submitPointChanged
  };
}