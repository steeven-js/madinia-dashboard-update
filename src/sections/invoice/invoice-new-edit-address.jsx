import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';

import { getAllCustomers } from 'src/hooks/use-customer';

import { Iconify } from 'src/components/iconify';

import { AddressListDialog } from '../address';

// ----------------------------------------------------------------------

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const values = watch();

  const addressTo = useBoolean();
  const addressForm = useBoolean();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { invoiceFrom, invoiceTo } = values;

  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const customersData = await getAllCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Format customer data for display
  const formattedCustomers = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    company: customer.company,
    fullAddress: `${customer.address}, ${customer.city}, ${customer.zipCode}, ${customer.country}`,
    phoneNumber: customer.phoneNumber,
    primary: customer.isPrimary,
  }));

  return (
    <>
      <Stack
        divider={
          <Divider
            flexItem
            orientation={mdUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ p: 3, gap: { xs: 3, md: 5 }, flexDirection: { xs: 'column', md: 'row' } }}
      >
        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              From:
            </Typography>

            <IconButton onClick={addressForm.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Box>

          <Stack spacing={1}>
            <Typography variant="subtitle2">{invoiceFrom?.name}</Typography>
            <Typography variant="body2">{invoiceFrom?.fullAddress}</Typography>
            <Typography variant="body2"> {invoiceFrom?.phoneNumber}</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              To:
            </Typography>

            <IconButton onClick={addressTo.onTrue}>
              <Iconify icon={invoiceTo ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Box>

          {invoiceTo ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{invoiceTo?.name}</Typography>
              <Typography variant="body2">{invoiceTo?.fullAddress}</Typography>
              <Typography variant="body2"> {invoiceTo?.phoneNumber}</Typography>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.invoiceTo?.message}
            </Typography>
          )}
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <AddressListDialog
            title="Your Business"
            open={addressForm.value}
            onClose={addressForm.onFalse}
            selected={(selectedId) => invoiceFrom?.id === selectedId}
            onSelect={(address) => setValue('invoiceFrom', address)}
            list={formattedCustomers.filter((customer) => customer.primary)}
          />

          <AddressListDialog
            title="Customers"
            open={addressTo.value}
            onClose={addressTo.onFalse}
            selected={(selectedId) => invoiceTo?.id === selectedId}
            onSelect={(address) => setValue('invoiceTo', address)}
            list={formattedCustomers}
            action={
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ alignSelf: 'flex-end' }}
              >
                New
              </Button>
            }
          />
        </>
      )}
    </>
  );
}
