import React, { useCallback, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useVolunteerSession } from '../../contexts/VolunteerSessionContext';
import { useAuth } from '../../hooks/useAuth';
import { useBantuan } from '../../hooks/useBantuan';
import { useGeocode } from '../../hooks/useGeocode';
import { HelpRequestDraft, HelpTypeId, MapPinPosition } from '../../types/helpRequest';
import { HelpTypeScreen } from './HelpTypeScreen';
import { LocationConfirmationScreen } from './LocationConfirmationScreen';
import { MatchedVolunteerScreen } from './MatchedVolunteerScreen';
import { SearchingVolunteerScreen } from './SearchingVolunteerScreen';

const INITIAL_DRAFT: HelpRequestDraft = {
  helpType: null,
  notes: '',
  pinPosition: { x: 0, y: 0 },
  volunteerIndex: 0
};

interface HelpRequestFlowProps {
  /**
   * "seeker" is a pencari bantuan asking for help, "volunteer" is a relawan
   * asking another relawan for backup during an ongoing session. Both run the
   * exact same four screens.
   */
  perspective?: 'seeker' | 'volunteer';
}

export function HelpRequestFlow({ perspective = 'seeker' }: HelpRequestFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isHelping } = useVolunteerSession();
  const { showServiceError } = useErrorHandling();
  const [draft, setDraft] = useState<HelpRequestDraft>(INITIAL_DRAFT);
  const { location } = useGeocode(draft.pinPosition);
  const {
    currentRequest,
    matchedVolunteer,
    matchingStatus,
    isMutating,
    createBantuanRequest,
    acceptRequest,
    cancelRequest,
    findAnotherVolunteer,
    retryMatching
  } = useBantuan(location ?
  {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.display_name
  } :
  undefined);
  const basePath = perspective === 'volunteer' ? '/bantuan-relawan' : '/minta-bantuan';

  const closeFlow = () => navigate('/dashboard');
  const selectHelpType = (helpType: HelpTypeId) =>
  setDraft((current) => ({
    ...current,
    helpType,
    // A description written for "Lainnya" is dropped when another type is chosen instead.
    notes: helpType !== 'other' && current.helpType === 'other' ? '' : current.notes
  }));
  const setNotes = (notes: string) => setDraft((current) => ({ ...current, notes }));
  const setPinPosition = (pinPosition: MapPinPosition) => setDraft((current) => ({ ...current, pinPosition }));

  const showMatch = useCallback(() => navigate(`${basePath}/relawan`), [basePath, navigate]);

  const beginSearch = () => {
    if (!draft.helpType || !location) return;
    navigate(`${basePath}/mencari`);
    void createBantuanRequest({
      requester_id: user?.account_id ?? 'RM-GUEST01',
      requester_role: perspective,
      jenis_bantuan: draft.helpType,
      lokasi: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.display_name
      },
      notes: draft.notes
    }).catch(() => undefined);
  };

  const findAnother = () => {
    navigate(`${basePath}/mencari`);
    void findAnotherVolunteer().catch(() => undefined);
  };

  const cancelFlow = () => {
    if (currentRequest) void cancelRequest(currentRequest.request_id).catch(() => undefined);
    navigate('/dashboard');
  };

  const acceptVolunteer = async () => {
    if (isMutating || !currentRequest) return;
    try {
      await acceptRequest(currentRequest.request_id);
      toast.success(
        perspective === 'volunteer' ? 'Relawan lain menerima permintaan Anda' : 'Relawan menerima permintaan Anda',
        { description: 'Pelacakan perjalanan relawan akan tampil di Dashboard Beranda.' }
      );
      navigate('/dashboard');
    } catch (reason) {
      showServiceError(reason, 'Permintaan bantuan gagal dikirim', 'Relawan belum menerima permintaan Anda. Coba lagi.');
    }
  };

  const hasHelpType = Boolean(draft.helpType);

  // Backup requests only exist inside an ongoing "Sedang Membantu" session.
  if (perspective === 'volunteer' && !isHelping) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route
        index
        element={
        <HelpTypeScreen
          selectedType={draft.helpType}
          description={draft.notes}
          onSelectType={selectHelpType}
          onDescriptionChange={setNotes}
          onContinue={() => navigate(`${basePath}/lokasi`)}
          onClose={closeFlow} />

        } />
      
      <Route
        path="lokasi"
        element={
        hasHelpType ?
        <LocationConfirmationScreen
          notes={draft.notes}
          pinPosition={draft.pinPosition}
          onNotesChange={setNotes}
          onPinPositionChange={setPinPosition}
          onSearch={beginSearch}
          onBack={() => navigate(basePath)}
          onClose={closeFlow} /> :


        <Navigate to={basePath} replace />

        } />
      
      <Route
        path="mencari"
        element={
        hasHelpType ?
        <SearchingVolunteerScreen
          status={matchingStatus}
          onRetry={retryMatching}
          onMatchFound={showMatch}
          onCancel={cancelFlow}
          onBack={() => navigate(`${basePath}/lokasi`)} /> :


        <Navigate to={basePath} replace />

        } />
      
      <Route
        path="relawan"
        element={
        hasHelpType ?
        matchedVolunteer ?
        <MatchedVolunteerScreen
          volunteer={matchedVolunteer}
          onAccept={() => void acceptVolunteer()}
          onFindAnother={findAnother}
          accepting={isMutating}
          onBack={() => navigate(`${basePath}/lokasi`)}
          onClose={cancelFlow} /> :


        <Navigate to={`${basePath}/mencari`} replace /> :


        <Navigate to={basePath} replace />

        } />
      
      <Route path="*" element={<Navigate to={basePath} replace />} />
    </Routes>);

}