import { useMemo } from 'react';
import { doc, query, where, getDoc, addDoc, getDocs, updateDoc, deleteDoc, collection } from 'firebase/firestore';

import { FIRESTORE } from 'src/lib/firebase';
import { _customerList } from 'src/_mock/_customer';

// ----------------------------------------------------------------------

/**
 * Hook pour gérer un client individuel
 * @param {string} id - L'identifiant du client
 * @returns {Object} - Objet contenant le client
 */
export function useCustomer(id) {
  const customer = useMemo(() => {
    if (id) {
      return _customerList.find((item) => item.id === id);
    }

    return _customerList[0];
  }, [id]);

  return { customer };
}

// ----------------------------------------------------------------------

/**
 * Récupère un client spécifique par son ID
 * @param {string} customerId - L'identifiant du client
 * @returns {Object|null} - Les données du client ou null si non trouvé
 */
export const getCustomer = async (customerId) => {
  try {
    const customerDoc = await getDoc(doc(FIRESTORE, 'customers', customerId));

    if (customerDoc.exists()) {
      return { id: customerDoc.id, ...customerDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

/**
 * Récupère tous les clients de la base de données
 * @returns {Array} - Tableau contenant tous les clients
 */
export const getAllCustomers = async () => {
  try {
    const customersSnapshot = await getDocs(collection(FIRESTORE, 'customers'));
    const customers = [];

    customersSnapshot.forEach((docSnapshot) => {
      customers.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });

    return customers;
  } catch (error) {
    console.error('Error getting all customers:', error);
    throw error;
  }
};

/**
 * Met à jour un client existant
 * @param {string} customerId - L'identifiant du client à mettre à jour
 * @param {Object} customerData - Les nouvelles données du client
 * @returns {Object} - Objet indiquant le succès de l'opération
 */
export const updateCustomer = async (customerId, customerData) => {
  try {
    const customerRef = doc(FIRESTORE, 'customers', customerId);
    await updateDoc(customerRef, customerData);
    return { success: true };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

/**
 * Supprime un client de la base de données
 * @param {string} customerId - L'identifiant du client à supprimer
 * @returns {Object} - Objet indiquant le succès de l'opération
 */
export const deleteCustomer = async (customerId) => {
  try {
    await deleteDoc(doc(FIRESTORE, 'customers', customerId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Ajoute un nouveau client à la base de données
 * @param {Object} customerData - Les données du nouveau client
 * @returns {Object} - Le client créé avec son ID
 */
export const addCustomer = async (customerData) => {
  try {
    const customersRef = collection(FIRESTORE, 'customers');
    const newCustomerRef = await addDoc(customersRef, customerData);

    return {
      id: newCustomerRef.id,
      ...customerData
    };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

/**
 * Recherche des clients selon un critère spécifique
 * @param {string} field - Le champ sur lequel effectuer la recherche
 * @param {any} value - La valeur recherchée
 * @returns {Array} - Tableau des clients correspondants aux critères
 */
export const searchCustomers = async (field, value) => {
  try {
    const customersRef = collection(FIRESTORE, 'customers');
    const q = query(customersRef, where(field, '==', value));
    const querySnapshot = await getDocs(q);

    const customers = [];
    querySnapshot.forEach((docSnapshot) => {
      customers.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });

    return customers;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};
