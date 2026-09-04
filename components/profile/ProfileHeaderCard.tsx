import React from 'react';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Avatar, Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';

import { LevelBadge } from '../shared/LevelBadge';
import { TrustScoreBadge } from '../shared/TrustScoreBadge';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';

interface ProfileHeaderCardProps {
  displayName: string;
  username: string;
  roleLabel: string;
  accountId: string;
  avatarUrl?: string;
  initials: string;
  trustScore: number;
  level: number;
  levelName: string;
  onEditUsername: () => void;
}

export function ProfileHeaderCard({
  displayName,
  username,
  roleLabel,
  accountId,
  avatarUrl,
  initials,
  trustScore,
  level,
  levelName,
  onEditUsername
}: ProfileHeaderCardProps) {
  const { showErrorToast } = useErrorHandling();

  const handleCopyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      toast.success('Account ID disalin', { description: accountId });
    } catch {
      showErrorToast('Account ID belum bisa disalin', `Salin manual: ${accountId}`);
    }
  };

  return (
    <Paper component="section" aria-labelledby="profile-identity-title" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2.5 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Avatar
          src={avatarUrl}
          alt={`Foto profil ${displayName}`}
          sx={{ width: 88, height: 88, flexShrink: 0, fontSize: '1.75rem', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          
          {initials}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {roleLabel}
          </Typography>
          <Typography id="profile-identity-title" component="h2" variant="h2" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            @{username}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap', rowGap: 1 }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04)
              }}>
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>
                ACCOUNT ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, letterSpacing: '0.06em' }}>
                {accountId}
              </Typography>
            </Box>
            <Tooltip title="Salin Account ID" arrow>
              <IconButton
                aria-label={`Salin Account ID ${accountId}`}
                onClick={handleCopyAccountId}
                size="small"
                sx={{ border: '1px solid', borderColor: 'divider', width: 36, height: 36 }}>
                
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
            <TrustScoreBadge trustScore={trustScore} size="medium" />
            <LevelBadge level={level} levelName={levelName} size="medium" />
          </Stack>
        </Box>

        <Button
          variant="outlined"
          startIcon={<EditRoundedIcon />}
          onClick={onEditUsername}
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>
          
          Edit Username
        </Button>
      </Stack>
    </Paper>);

}