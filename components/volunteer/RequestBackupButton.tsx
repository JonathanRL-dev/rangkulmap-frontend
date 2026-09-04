import React, { useEffect, useRef, useState } from 'react';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { Button, Tooltip } from '@mui/material';

const DISABLED_HINT = 'Fitur ini hanya bisa dipakai saat sedang membantu seseorang';

interface RequestBackupButtonProps {
  /** Only an ongoing "Sedang Membantu" session unlocks the request. */
  isHelping: boolean;
  onRequestBackup: () => void;
}

export function RequestBackupButton({ isHelping, onRequestBackup }: RequestBackupButtonProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const hintTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(hintTimeoutRef.current), []);

  const clearHintTimeout = () => window.clearTimeout(hintTimeoutRef.current);

  const showHint = (autoHide = false) => {
    clearHintTimeout();
    setHintOpen(true);
    if (autoHide) {
      hintTimeoutRef.current = window.setTimeout(() => setHintOpen(false), 2800);
    }
  };

  const hideHint = () => {
    clearHintTimeout();
    setHintOpen(false);
  };

  const handleClick = () => {
    if (!isHelping) {
      // Keeps the reason discoverable on touch devices, where hover never fires.
      showHint(true);
      return;
    }
    hideHint();
    onRequestBackup();
  };

  return (
    <Tooltip
      title={isHelping ? 'Minta bantuan relawan lain untuk sesi ini' : DISABLED_HINT}
      arrow
      open={hintOpen}
      onOpen={() => showHint()}
      onClose={hideHint}>
      
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<GroupAddRoundedIcon />}
        aria-disabled={!isHelping}
        onClick={handleClick}
        sx={{
          minHeight: 56,
          ...(isHelping ?
          null :
          {
            bgcolor: 'action.disabledBackground',
            color: 'text.disabled',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'action.disabledBackground', boxShadow: 'none' }
          })
        }}>
        
        Minta Bantuan Relawan Lain
      </Button>
    </Tooltip>);

}