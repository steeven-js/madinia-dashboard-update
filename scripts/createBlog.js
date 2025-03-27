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

// Fonction pour générer un ID unique
const generateId = () => faker.string.uuid();

// Fonction pour générer un avatar aléatoire
const generateAvatar = (index) => `https://api-dev-minimal-v630.pages.dev/assets/images/avatar/avatar-${index}.webp`;

// Fonction pour générer un auteur
const generateAuthor = () => {
  const authorIndex = faker.number.int({ min: 1, max: 20 });
  return {
    name: faker.person.fullName(),
    avatarUrl: generateAvatar(authorIndex)
  };
};

// Fonction pour générer un commentaire
const generateComment = (index) => {
  const userId = generateId();
  const avatarIndex = ((index % 20) || 1);

  // Générer des utilisateurs marqués dans le commentaire
  const usersCount = faker.number.int({ min: 0, max: 3 });
  const users = Array.from({ length: usersCount }).map((_, i) => ({
    id: generateId(),
    name: faker.person.fullName(),
    avatarUrl: generateAvatar(avatarIndex + i + 1)
  }));

  // Générer des réponses au commentaire
  const replyCount = faker.number.int({ min: 0, max: 3 });
  const replyComment = Array.from({ length: replyCount }).map((_, i) => {
    const replyUserId = users[i] ? users[i].id : generateId();
    const replyDate = format(sub(new Date(), { days: i + 2 }), "yyyy-MM-dd'T'HH:mm:ssxxx");

    return {
      id: generateId(),
      userId: replyUserId,
      message: faker.lorem.sentence(),
      tagUser: i > 0 ? faker.person.fullName() : null,
      postedAt: replyDate
    };
  });

  return {
    id: generateId(),
    name: faker.person.fullName(),
    avatarUrl: generateAvatar(avatarIndex),
    message: faker.lorem.sentence(),
    postedAt: format(sub(new Date(), { days: index }), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    users,
    replyComment
  };
};

// Fonction pour générer une liste de personnes favorites
const generateFavoritePeople = () => {
  const count = faker.number.int({ min: 10, max: 20 });

  return Array.from({ length: count }).map((_, index) => ({
    name: faker.person.fullName(),
    avatarUrl: generateAvatar(index + 1)
  }));
};

// Fonction pour générer un article de blog
const generatePost = (index) => {
  const publishStates = ['published', 'draft', 'scheduled'];
  const tags = ['Technology', 'Health and Wellness', 'Travel', 'Finance', 'Education', 'Entertainment', 'Science', 'Sports', 'Business', 'Art', 'Food', 'Environment'];

  // Générer des commentaires
  const commentsCount = faker.number.int({ min: 1, max: 5 });
  const comments = Array.from({ length: commentsCount }).map((_, i) => generateComment(i));

  const randomTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 3, max: 5 }));
  const randomMetaKeywords = faker.helpers.arrayElements(tags, faker.number.int({ min: 3, max: 5 }));

  return {
    id: generateId(),
    publish: faker.helpers.arrayElement(publishStates),
    comments,
    metaKeywords: randomMetaKeywords,
    content: `
<h1 class="nml__editor__content__heading" style="text-align: start">Heading H1</h1>
<h2 class="nml__editor__content__heading" style="text-align: start">Heading H2</h2>
<p style="text-align: start">${faker.lorem.paragraphs(3)}</p>
<blockquote class="nml__editor__content__blockquote">
   <p>${faker.lorem.sentence()}&nbsp;</p>
</blockquote>
<img class="nml__editor__content__image" src="https://api-dev-minimal-v630.pages.dev/assets/images/cover/cover-${index + 1}.webp">
<p>${faker.lorem.paragraphs(2)}</p>
<ul class="nml__editor__content__bullet__list">
   <li class="nml__editor__content__listItem">
      <p>${faker.lorem.sentence()}</p>
   </li>
   <li class="nml__editor__content__listItem">
      <p>${faker.lorem.sentence()}</p>
   </li>
   <li class="nml__editor__content__listItem">
      <p>${faker.lorem.sentence()}</p>
   </li>
</ul>
`,
    tags: randomTags,
    metaTitle: faker.lorem.words(3),
    createdAt: format(sub(new Date(), { days: index }), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    title: faker.lorem.sentence(),
    coverUrl: `https://api-dev-minimal-v630.pages.dev/assets/images/cover/cover-${(index % 20) + 1}.webp`,
    totalViews: faker.number.int({ min: 1000, max: 10000 }),
    totalShares: faker.number.int({ min: 1000, max: 10000 }),
    totalComments: faker.number.int({ min: 500, max: 2000 }),
    totalFavorites: faker.number.int({ min: 1000, max: 7000 }),
    metaDescription: faker.lorem.paragraph(),
    description: faker.lorem.paragraph(),
    author: generateAuthor(),
    favoritePerson: generateFavoritePeople()
  };
};

// Fonction principale pour générer et insérer les données
const generatePosts = async () => {
  try {
    console.log('Début de la génération des posts...');

    const batch = db.batch();
    const postsCollection = db.collection('posts');

    // Générer 5 posts
    for (let i = 0; i < 5; i++) {
      const post = generatePost(i);
      const docRef = postsCollection.doc(post.id);
      batch.set(docRef, post);
      console.log(`Post ${i + 1} généré avec ID: ${post.id}`);
    }

    // Exécuter le batch
    await batch.commit();
    console.log('Les 5 posts ont été ajoutés avec succès à Firestore');

  } catch (error) {
    console.error('Erreur lors de la génération des posts:', error);
  } finally {
    // Fermer la connexion
    process.exit(0);
  }
};

// Exécuter la fonction principale
generatePosts();