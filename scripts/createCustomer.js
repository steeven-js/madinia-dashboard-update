import admin from 'firebase-admin';
import { faker } from '@faker-js/faker/locale/fr';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

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

// Fonction pour générer un client avec des données aléatoires
function generateCustomer() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const company = faker.company.name();

  return {
    name,
    email: faker.internet.email({ firstName, lastName }),
    phoneNumber: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: 'France',
    company,
    role: faker.person.jobTitle(),
    isVerified: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(['active', 'pending', 'banned', 'rejected']),
    avatarUrl: `https://assets.minimals.cc/public/assets/images/mock/avatar/avatar-${faker.number.int({ min: 1, max: 25 })}.webp`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// Fonction pour créer 5 clients dans Firestore
async function createCustomers() {
  try {
    console.log('Création de 5 clients en cours...');

    for (let i = 0; i < 5; i++) {
      const customerData = generateCustomer();
      const customerRef = await db.collection('customers').add(customerData);

      console.log(`Client créé avec ID: ${customerRef.id}`);
      console.log(customerData);
      console.log('-----------------------------------');
    }

    console.log('5 clients ont été créés avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des clients:', error);
    process.exit(1);
  }
}

// Exécution de la fonction
createCustomers();
