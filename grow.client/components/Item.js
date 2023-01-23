'use client';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';


export const Item = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  boxSizing: 'border-box',
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));
