import { useCallback, useState } from 'react';

import {
  UploadResult,
  VerificationUploadResult,
  uploadPublicPhoto as uploadPublicPhotoService,
  uploadVerificationDocument as uploadVerificationDocumentService } from
'../services/uploadService';
import { AppErrorType, toAppError } from '../services/apiClient';

interface UseUploadValue {
  isUploading: boolean;
  error: string | null;
  errorType: AppErrorType | null;
  uploadPublicPhoto: (file: File) => Promise<UploadResult>;
  uploadVerificationDocument: (file: File) => Promise<VerificationUploadResult>;
  clearError: () => void;
}

export function useUpload(): UseUploadValue {
  const [pendingUploads, setPendingUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);

  const runUpload = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    setPendingUploads((current) => current + 1);
    setError(null);
    setErrorType(null);
    try {
      return await operation();
    } catch (reason) {
      const appError = toAppError(reason, 'File gagal diunggah.');
      setError(appError.message);
      setErrorType(appError.type);
      throw appError;
    } finally {
      setPendingUploads((current) => Math.max(0, current - 1));
    }
  }, []);

  return {
    isUploading: pendingUploads > 0,
    error,
    errorType,
    uploadPublicPhoto: useCallback(
      (file) => runUpload(() => uploadPublicPhotoService(file)),
      [runUpload]
    ),
    uploadVerificationDocument: useCallback(
      (file) => runUpload(() => uploadVerificationDocumentService(file)),
      [runUpload]
    ),
    clearError: useCallback(() => {
      setError(null);
      setErrorType(null);
    }, [])
  };
}