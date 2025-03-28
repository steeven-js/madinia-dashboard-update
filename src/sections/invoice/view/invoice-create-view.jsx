import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { addInvoice } from 'src/hooks/use-invoice';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceCreateView() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateInvoice = async (invoiceData) => {
    try {
      setSubmitting(true);
      // Ensure the customer data is correctly formatted for storage
      const formattedInvoiceData = {
        ...invoiceData,
        invoiceTo: {
          id: invoiceData.invoiceTo.id,
          name: invoiceData.invoiceTo.name,
          company: invoiceData.invoiceTo.company || '',
          address: invoiceData.invoiceTo.fullAddress,
          phoneNumber: invoiceData.invoiceTo.phoneNumber,
        },
        invoiceFrom: invoiceData.invoiceFrom
          ? {
              id: invoiceData.invoiceFrom.id,
              name: invoiceData.invoiceFrom.name,
              company: invoiceData.invoiceFrom.company || '',
              address: invoiceData.invoiceFrom.fullAddress,
              phoneNumber: invoiceData.invoiceFrom.phoneNumber,
            }
          : null,
      };

      const newInvoiceId = await addInvoice(formattedInvoiceData);
      toast.success('Facture créée avec succès!');
      navigate(paths.dashboard.invoice.details(newInvoiceId));
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new invoice"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: 'New invoice' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm onSubmit={handleCreateInvoice} isSubmitting={submitting} />
    </DashboardContent>
  );
}
