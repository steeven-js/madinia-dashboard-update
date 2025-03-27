import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'banned', label: 'Banned' },
  { value: 'rejected', label: 'Rejected' },
];

export const _customerAbout = {
  id: _mock.id(1),
  name: _mock.fullName(1),
  role: _mock.role(1),
  email: _mock.email(1),
  school: _mock.companyNames(2),
  company: _mock.companyNames(1),
  country: _mock.countryNames(2),
  avatarUrl: _mock.image.avatar(1),
  coverUrl: _mock.image.cover(3),
  totalFollowers: _mock.number.nativeL(1),
  totalFollowing: _mock.number.nativeL(2),
  quote:
    'Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..',
  socialLinks: {
    facebook: `https://www.facebook.com/caitlyn.kerluke`,
    instagram: `https://www.instagram.com/caitlyn.kerluke`,
    linkedin: `https://www.linkedin.com/in/caitlyn.kerluke`,
    twitter: `https://www.twitter.com/caitlyn.kerluke`,
  },
};

export const _customerFollowers = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  country: _mock.countryNames(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _customerFriends = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _customerGallery = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  imageUrl: _mock.image.cover(index),
}));

export const _customerFeeds = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  createdAt: _mock.time(index),
  media: _mock.image.travel(index + 1),
  message: _mock.sentence(index),
  personLikes: Array.from({ length: 20 }, (__, personIndex) => ({
    name: _mock.fullName(personIndex),
    avatarUrl: _mock.image.avatar(personIndex + 2),
  })),
  comments: (index === 2 && []) || [
    {
      id: _mock.id(7),
      author: {
        id: _mock.id(8),
        avatarUrl: _mock.image.avatar(index + 5),
        name: _mock.fullName(index + 5),
      },
      createdAt: _mock.time(2),
      message: 'Praesent venenatis metus at',
    },
    {
      id: _mock.id(9),
      author: {
        id: _mock.id(10),
        avatarUrl: _mock.image.avatar(index + 6),
        name: _mock.fullName(index + 6),
      },
      createdAt: _mock.time(3),
      message:
        'Etiam rhoncus. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed lectus.',
    },
  ],
}));

export const _customerPayment = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  cardNumber: ['**** **** **** 1234', '**** **** **** 5678', '**** **** **** 7878'][index],
  cardType: ['mastercard', 'visa', 'visa'][index],
  primary: index === 1,
}));

export const _customerAddressBook = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  phoneNumber: _mock.phoneNumber(index),
  fullAddress: _mock.fullAddress(index),
  addressType: (index === 0 && 'Home') || 'Office',
}));

export const _customerInvoices = Array.from({ length: 10 }, (_, index) => ({
  id: _mock.id(index),
  invoiceNumber: `INV-199${index}`,
  createdAt: _mock.time(index),
  price: _mock.number.price(index),
}));

export const _customerPlans = [
  { subscription: 'basic', price: 0, primary: false },
  { subscription: 'starter', price: 4.99, primary: true },
  { subscription: 'premium', price: 9.99, primary: false },
];

export const _customerList = [
  {
    id: _mock.id(1),
    zipCode: '75001',
    state: 'Île-de-France',
    city: 'Paris',
    role: 'CEO',
    email: 'thomas.dubois@example.com',
    address: '23 Rue de la Paix',
    name: 'Thomas Dubois',
    isVerified: true,
    company: 'Dubois Technologies',
    country: 'France',
    avatarUrl: _mock.image.avatar(1),
    phoneNumber: '+33 6 12 34 56 78',
    status: 'active',
  },
  {
    id: _mock.id(2),
    zipCode: '69001',
    state: 'Auvergne-Rhône-Alpes',
    city: 'Lyon',
    role: 'Manager',
    email: 'sophie.martin@example.com',
    address: '15 Place Bellecour',
    name: 'Sophie Martin',
    isVerified: true,
    company: 'Lyon Consultants',
    country: 'France',
    avatarUrl: _mock.image.avatar(2),
    phoneNumber: '+33 6 98 76 54 32',
    status: 'active',
  },
  {
    id: _mock.id(3),
    zipCode: '13001',
    state: 'Provence-Alpes-Côte d\'Azur',
    city: 'Marseille',
    role: 'Developer',
    email: 'pierre.moreau@example.com',
    address: '7 Quai des Belges',
    name: 'Pierre Moreau',
    isVerified: true,
    company: 'Sud Solutions',
    country: 'France',
    avatarUrl: _mock.image.avatar(3),
    phoneNumber: '+33 6 45 67 89 01',
    status: 'pending',
  },
  {
    id: _mock.id(4),
    zipCode: '44000',
    state: 'Pays de la Loire',
    city: 'Nantes',
    role: 'Designer',
    email: 'julie.leroy@example.com',
    address: '3 Cours Cambronne',
    name: 'Julie Leroy',
    isVerified: false,
    company: 'Design Express',
    country: 'France',
    avatarUrl: _mock.image.avatar(4),
    phoneNumber: '+33 6 23 45 67 89',
    status: 'banned',
  },
  {
    id: _mock.id(5),
    zipCode: '33000',
    state: 'Nouvelle-Aquitaine',
    city: 'Bordeaux',
    role: 'Marketing',
    email: 'maxime.petit@example.com',
    address: '10 Place de la Bourse',
    name: 'Maxime Petit',
    isVerified: true,
    company: 'Bordeaux Marketing',
    country: 'France',
    avatarUrl: _mock.image.avatar(5),
    phoneNumber: '+33 6 78 90 12 34',
    status: 'rejected',
  },
];

export const _customerCards = _customerList.map((customer, index) => ({
  id: customer.id,
  role: customer.role,
  name: customer.name,
  coverUrl: _mock.image.cover(index + 1),
  avatarUrl: customer.avatarUrl,
  totalFollowers: _mock.number.nativeL(index + 1),
  totalPosts: _mock.number.nativeL(index + 3),
  totalFollowing: _mock.number.nativeL(index + 2),
}));
