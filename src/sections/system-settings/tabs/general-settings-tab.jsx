import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GeneralSettingsTab() {
  const [appSettings, setAppSettings] = useState({
    appName: CONFIG.appName,
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    apiRateLimit: 100,
    sessionTimeout: 60,
    maxUploadSize: 10,
  });

  const handleChangeSetting = (e) => {
    const { name, value, checked, type } = e.target;
    setAppSettings({
      ...appSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveChanges = () => {
    // Simulation de sauvegarde
    toast.success('Paramètres enregistrés avec succès!');
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Paramètres de l'Application" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom de l'Application"
                    name="appName"
                    value={appSettings.appName}
                    onChange={handleChangeSetting}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Délai d'expiration de session (minutes)"
                    name="sessionTimeout"
                    type="number"
                    value={appSettings.sessionTimeout}
                    onChange={handleChangeSetting}
                    inputProps={{ min: 1, max: 1440 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Taille maximale d'upload (MB)"
                    name="maxUploadSize"
                    type="number"
                    value={appSettings.maxUploadSize}
                    onChange={handleChangeSetting}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Limite d'API (requêtes/minute)"
                    name="apiRateLimit"
                    type="number"
                    value={appSettings.apiRateLimit}
                    onChange={handleChangeSetting}
                    inputProps={{ min: 10, max: 1000 }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <FormGroup>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.maintenanceMode}
                          onChange={handleChangeSetting}
                          name="maintenanceMode"
                        />
                      }
                      label="Mode Maintenance"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.registrationEnabled}
                          onChange={handleChangeSetting}
                          name="registrationEnabled"
                        />
                      }
                      label="Inscription utilisateur activée"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.emailNotifications}
                          onChange={handleChangeSetting}
                          name="emailNotifications"
                        />
                      }
                      label="Notifications par email"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Journaux Système" />
            <CardContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                Les journaux système vous permettent de suivre les actions importantes dans
                l'application.
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Actions récentes
                </Typography>
                <Stack
                  spacing={1}
                  sx={{
                    maxHeight: 240,
                    overflow: 'auto',
                    p: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                  }}
                >
                  {[...Array(5)].map((_, index) => (
                    <Box key={index} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {`${new Date().toLocaleString()} - `}
                        <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                          Utilisateur admin a modifié les paramètres
                        </Typography>
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined">Réinitialiser</Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:save-fill" />}
              onClick={handleSaveChanges}
            >
              Enregistrer les modifications
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
