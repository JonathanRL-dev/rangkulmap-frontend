import React from 'react';
import AccessibleRoundedIcon from '@mui/icons-material/AccessibleRounded';
import DirectionsBusFilledRoundedIcon from '@mui/icons-material/DirectionsBusFilledRounded';
import ElevatorRoundedIcon from '@mui/icons-material/ElevatorRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import WcRoundedIcon from '@mui/icons-material/WcRounded';

import { InfrastructureCategory } from '../../types/infrastructure';

interface CategoryIconProps {
  category: InfrastructureCategory;
  fontSize?: 'small' | 'medium' | 'large';
}

export function CategoryIcon({ category, fontSize = 'small' }: CategoryIconProps) {
  switch (category) {
    case 'wheelchair-route':
      return <AccessibleRoundedIcon fontSize={fontSize} />;
    case 'accessible-toilet':
      return <WcRoundedIcon fontSize={fontSize} />;
    case 'elevator':
      return <ElevatorRoundedIcon fontSize={fontSize} />;
    case 'disabled-parking':
      return <LocalParkingRoundedIcon fontSize={fontSize} />;
    case 'accessible-stop':
      return <DirectionsBusFilledRoundedIcon fontSize={fontSize} />;
  }
}