import { useMemo } from 'react';
import { doc, query, where, getDoc, addDoc, getDocs, updateDoc, deleteDoc, collection } from 'firebase/firestore';

import { FIRESTORE } from 'src/lib/firebase';
import { _customerList } from 'src/_mock/_customer';

// ----------------------------------------------------------------------

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

// Récupérer pour afficher les informations du client
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

// Mettre à jour les informations du client
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

// Supprimer le client
export const deleteCustomer = async (customerId) => {
  try {
    await deleteDoc(doc(FIRESTORE, 'customers', customerId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Ajouter un client
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

// Rechercher des clients par critères
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

