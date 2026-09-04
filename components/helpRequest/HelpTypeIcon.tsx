import React from 'react';
import AccessibleForwardRoundedIcon from '@mui/icons-material/AccessibleForwardRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LuggageRoundedIcon from '@mui/icons-material/LuggageRounded';
import StairsRoundedIcon from '@mui/icons-material/StairsRounded';

import { HelpTypeId } from '../../types/helpRequest';

interface HelpTypeIconProps {
  type: HelpTypeId;
  fontSize?: number;
}

export function HelpTypeIcon({ type, fontSize = 48 }: HelpTypeIconProps) {
  switch (type) {
    case 'crossing':
      return <AccessibleForwardRoundedIcon sx={{ fontSize }} />;
    case 'stairs':
      return <StairsRoundedIcon sx={{ fontSize }} />;
    case 'carrying':
      return <LuggageRoundedIcon sx={{ fontSize }} />;
    case 'other':
      return <CategoryRoundedIcon sx={{ fontSize }} />;
  }
}