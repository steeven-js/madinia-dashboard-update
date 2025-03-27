import admin from 'firebase-admin';
import { faker } from '@faker-js/faker/locale/fr';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { format, add, sub } from 'date-fns';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement du fichier de configuration
const serviceAccount = require(join(__dirname, '../madinia-dashboard-firebase-adminsdk-fbsvc-783c853b81.json'));

// Initialisation de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Status possibles pour les factures
const INVOICE_STATUS_OPTIONS = [
  'paid',
  'pending',
  'overdue',
  'draft',
];

// Fonction pour générer des services
function generateServices(count = 8) {
  const TAGS = [
    'Technology',
    'Health and Wellness',
    'Travel',
    'Finance',
    'Education',
    'Food and Beverage',
    'Fashion',
    'Home and Garden',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: faker.string.uuid(),
    name: TAGS[index],
    price: parseFloat(faker.commerce.price({ min: 50, max: 200 })),
  }));
}

// Fonction pour générer des éléments de facture
function generateItems(services, count = 3) {
  return Array.from({ length: count }, (_, index) => {
    const service = services[index % services.length];
    const quantity = faker.number.int({ min: 1, max: 5 });
    const total = service.price * quantity;

    return {
      id: faker.string.uuid(),
      total,
      title: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: service.price,
      service: service.name,
      quantity,
    };
  });
}

// Fonction pour générer une adresse
function generateAddress() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    fullAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()} ${faker.location.country()}`,
    company: faker.company.name(),
    addressType: faker.helpers.arrayElement(['Home', 'Office']),
  };
}

// Fonction pour générer une facture avec des données aléatoires
function generateInvoice(index) {
  const services = generateServices();
  const items = generateItems(services);

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const taxes = parseFloat(faker.commerce.price({ min: 10, max: 50 }));
  const discount = parseFloat(faker.commerce.price({ min: 5, max: 30 }));
  const shipping = parseFloat(faker.commerce.price({ min: 5, max: 20 }));
  const totalAmount = subtotal + taxes - discount + shipping;

  // Utiliser INVOICE_STATUS_OPTIONS pour déterminer le statut
  const status = INVOICE_STATUS_OPTIONS[index % INVOICE_STATUS_OPTIONS.length];

  // Générer des dates
  const createDate = sub(new Date(), { days: index });
  const dueDate = add(createDate, { days: 15 + index, hours: index });

  return {
    id: faker.string.uuid(),
    taxes,
    status,
    discount,
    shipping,
    subtotal,
    totalAmount,
    items,
    invoiceNumber: `INV-${format(new Date(), 'yyyy')}-${String(index).padStart(3, '0')}`,
    invoiceFrom: generateAddress(),
    invoiceTo: generateAddress(),
    sent: faker.number.int({ min: 1, max: 10 }),
    createDate: createDate.toISOString(),
    dueDate: dueDate.toISOString(),
  };
}

// Fonction principale pour créer et sauvegarder les factures
async function createInvoices() {
  try {
    console.log('Démarrage de la création des factures...');

    // Créer un batch pour enregistrer plusieurs documents en une seule transaction
    const batch = db.batch();

    // Générer 15 factures
    for (let i = 0; i < 15; i++) {
      const invoice = generateInvoice(i);
      const docRef = db.collection('invoices').doc(invoice.id);
      batch.set(docRef, invoice);
      console.log(`Facture ${i + 1} préparée: ${invoice.invoiceNumber}`);
    }

    // Exécuter le batch
    await batch.commit();
    console.log('Toutes les factures ont été créées avec succès!');

  } catch (error) {
    console.error('Erreur lors de la création des factures:', error);
  } finally {
    // Fermer la connexion Firebase
    await admin.app().delete();
    console.log('Terminé.');
  }
}

// Exécuter la fonction principale
createInvoices();
