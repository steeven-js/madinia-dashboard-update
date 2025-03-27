import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { useParams } from 'src/routes/hooks';

import { getInvoice } from 'src/hooks/use-invoice';

import { CONFIG } from 'src/global-config';

import { InvoiceEditView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

const metadata = { title: `Invoice edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const invoiceData = await getInvoice(id);
        setInvoice(invoiceData);
      } catch (err) {
        console.error('Erreur lors de la récupération de la facture:', err);
        setError('Impossible de charger les détails de la facture');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        {error || 'Facture non trouvée'}
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InvoiceEditView invoice={invoice} />
    </>
  );
}
