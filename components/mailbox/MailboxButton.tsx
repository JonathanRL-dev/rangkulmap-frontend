import React from 'react';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import { Badge, IconButton, Tooltip } from '@mui/material';

interface MailboxButtonProps {
  unclaimedCount: number;
  onOpen: () => void;
}

export function MailboxButton({ unclaimedCount, onOpen }: MailboxButtonProps) {
  const accessibleLabel =
  unclaimedCount > 0 ? `Buka Mailbox. ${unclaimedCount} hadiah belum diklaim` : 'Buka Mailbox';

  return (
    <Tooltip title={unclaimedCount > 0 ? `${unclaimedCount} hadiah belum diklaim` : 'Buka Mailbox'} arrow>
      <IconButton
        aria-label={accessibleLabel}
        onClick={onOpen}
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
        
        <Badge
          badgeContent={unclaimedCount}
          invisible={unclaimedCount === 0}
          max={99}
          color="warning"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              minWidth: 20,
              height: 20,
              px: 0.5,
              border: '2px solid',
              borderColor: 'background.paper',
              color: 'warning.contrastText',
              fontSize: '0.6875rem'
            }
          }}>
          
          <MailRoundedIcon aria-hidden="true" />
        </Badge>
      </IconButton>
    </Tooltip>);

}