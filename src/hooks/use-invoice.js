import { useState, useEffect } from 'react';
import { doc, query, where, getDoc, addDoc, getDocs, updateDoc, deleteDoc, collection } from 'firebase/firestore';

import { FIRESTORE } from 'src/lib/firebase';

// ----------------------------------------------------------------------

/**
 * Hook pour gérer une facture individuelle
 * @param {string} id - L'identifiant de la facture
 * @returns {Object} - Objet contenant la facture, l'état de chargement et les erreurs
 */
export function useInvoice(id) {
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

  return { invoice, loading, error };
}

// ----------------------------------------------------------------------

/**
 * Récupère une facture spécifique par son ID
 * @param {string} invoiceId - L'identifiant de la facture
 * @returns {Object|null} - Les données de la facture ou null si non trouvée
 */
export const getInvoice = async (invoiceId) => {
  const invoiceDoc = await getDoc(doc(FIRESTORE, 'invoices', invoiceId));

  if (invoiceDoc.exists()) {
    return { id: invoiceDoc.id, ...invoiceDoc.data() };
  }

  return null;
};

/**
 * Récupère toutes les factures de la base de données
 * @returns {Array} - Tableau contenant toutes les factures
 */
export const getAllInvoices = async () => {
  const invoicesSnapshot = await getDocs(collection(FIRESTORE, 'invoices'));
  const invoices = [];

  invoicesSnapshot.forEach((docSnapshot) => {
    invoices.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

  return invoices;
};

/**
 * Met à jour une facture existante
 * @param {string} invoiceId - L'identifiant de la facture à mettre à jour
 * @param {Object} invoiceData - Les nouvelles données de la facture
 */
export const updateInvoice = async (invoiceId, invoiceData) => {
  const invoiceDocRef = doc(FIRESTORE, 'invoices', invoiceId);
  await updateDoc(invoiceDocRef, invoiceData);
};

/**
 * Supprime une facture de la base de données
 * @param {string} invoiceId - L'identifiant de la facture à supprimer
 */
export const deleteInvoice = async (invoiceId) => {
  const invoiceDocRef = doc(FIRESTORE, 'invoices', invoiceId);
  await deleteDoc(invoiceDocRef);
};

/**
 * Ajoute une nouvelle facture à la base de données
 * @param {Object} invoiceData - Les données de la nouvelle facture
 * @returns {string} - L'identifiant de la nouvelle facture créée
 */
export const addInvoice = async (invoiceData) => {
  const invoiceRef = await addDoc(collection(FIRESTORE, 'invoices'), invoiceData);
  return invoiceRef.id;
};

/**
 * Recherche une facture par son numéro
 * @param {string} invoiceNumber - Le numéro de la facture à rechercher
 * @returns {Array} - Tableau des factures correspondantes
 */
export const searchInvoiceByNumber = async (invoiceNumber) => {
  const invoicesQuery = query(collection(FIRESTORE, 'invoices'), where('invoiceNumber', '==', invoiceNumber));
  const invoicesSnapshot = await getDocs(invoicesQuery);
  return invoicesSnapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};
