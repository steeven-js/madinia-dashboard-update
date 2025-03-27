import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { updateInvoice } from 'src/hooks/use-invoice';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceEditView({ invoice }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateInvoice = async (invoiceData) => {
    try {
      setSubmitting(true);
      await updateInvoice(invoice.id, invoiceData);
      toast.success('Facture mise à jour avec succès!');
      navigate(paths.dashboard.invoice.details(invoice.id));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      toast.error('Erreur lors de la mise à jour de la facture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.invoice.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: invoice?.invoiceNumber },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm
        currentInvoice={invoice}
        onSubmit={handleUpdateInvoice}
        isSubmitting={submitting}
      />
    </DashboardContent>
  );
}
