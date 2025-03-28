import { Container } from '@mui/system';
import { Grid, Typography } from '@mui/material';

import { KanbanLabelsSettings } from './kanban-labels-settings';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function KanbanSettings() {
  return (
    <DashboardContent title="Paramètres du Kanban">
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Paramètres du Kanban
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <KanbanLabelsSettings />
          </Grid>
          {/* D'autres sections de paramètres pourront être ajoutées ici */}
        </Grid>
      </Container>
    </DashboardContent>
  );
}
