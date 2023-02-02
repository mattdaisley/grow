'use client';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export function DynamicAppBar({ dynamicItem, dynamicFormData }) {
  return (
    <AppBar position="sticky" color="paper" sx={{ top: 0, bottom: 'auto' }}>
      <Toolbar disableGutters sx={{ py: 2, px: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="subtitle1">{dynamicItem.item.name} / {dynamicFormData.currentPage.name}</Typography>
        <Typography variant="subtitle2">Up to date as of {new Date(dynamicFormData.timestamp).toLocaleString('en-us')}</Typography>
      </Toolbar>
    </AppBar>
  );
}
