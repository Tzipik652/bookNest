import { Book } from '../types';

export const initialBooks: Book[] = [
  {
    id: '1',
    title: 'The Art of War',
    author: 'Sun Tzu',
    description: 'An ancient Chinese military treatise dating from the Late Spring and Autumn Period.',
    category: 'Non-Fiction',
    imageUrl: 'https://images.unsplash.com/photo-1560362415-c88a4c066155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwYm9va3MlMjBsaWJyYXJ5fGVufDF8fHx8MTc2MjE2MDU2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 12.99,
    aiSummary: 'A timeless classic on strategy and warfare that transcends military applications. This ancient text explores tactics, positioning, and the psychology of conflict, offering wisdom applicable to business, leadership, and personal development. Sun Tzu emphasizes the importance of knowing oneself and one\'s opponent, and winning without fighting when possible.',
    uploaderId: 'demo-user',
    uploaderName: 'Demo User',
    createdAt: '2024-10-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    description: 'A gripping psychological thriller about a marriage gone terribly wrong.',
    category: 'Mystery',
    imageUrl: 'https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rfGVufDF8fHx8MTc2MjE5MzE2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 15.99,
    aiSummary: 'A masterful psychological thriller that keeps readers guessing until the very end. When Amy Dunne disappears on her fifth wedding anniversary, all eyes turn to her husband Nick. Through alternating perspectives and shocking revelations, Flynn crafts a dark exploration of marriage, media manipulation, and the masks we wear in relationships.',
    uploaderId: 'demo-user',
    uploaderName: 'Demo User',
    createdAt: '2024-10-16T11:30:00Z'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction epic set in a distant future amidst a huge interstellar empire.',
    category: 'Science Fiction',
    imageUrl: 'https://images.unsplash.com/photo-1687985826611-80b714011d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMHNwYWNlfGVufDF8fHx8MTc2MjE5NDk5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 18.99,
    aiSummary: 'An epic science fiction masterpiece that combines politics, religion, ecology, and human evolution. Set on the desert planet Arrakis, the story follows young Paul Atreides as his family takes control of the planet, the only source of the universe\'s most valuable substance. A profound exploration of power, prophecy, and environmental stewardship.',
    uploaderId: 'demo-user',
    uploaderName: 'Demo User',
    createdAt: '2024-10-17T14:20:00Z'
  },
  {
    id: '4',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    description: 'The riveting first-person narrative of a young man who grows to be the most notorious magician his world has ever seen.',
    category: 'Fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1633856364580-97698963b68b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWFnaWMlMjBib29rfGVufDF8fHx8MTc2MjE2MTMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 16.99,
    aiSummary: 'A beautifully written fantasy tale told as a story within a story. Kvothe, now living in disguise as an innkeeper, recounts his past: his childhood in a troupe of traveling players, his years spent as a near-feral orphan in the slums, and his time at a legendary school of magic. Rich prose and intricate world-building make this an instant classic.',
    uploaderId: 'demo-user',
    uploaderName: 'Demo User',
    createdAt: '2024-10-18T09:45:00Z'
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners set in Georgian England.',
    category: 'Romance',
    imageUrl: 'https://images.unsplash.com/photo-1663869025988-771b0d7f8a89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwbm92ZWwlMjByZWFkaW5nfGVufDF8fHx8MTc2MjI0Nzc4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 10.99,
    aiSummary: 'A timeless romance that explores the intersection of love, class, and social expectations in Regency England. Elizabeth Bennet and Mr. Darcy must overcome their pride and prejudices to find love. Austen\'s wit and social commentary remain as relevant today as when first published, making this a perennial favorite.',
    uploaderId: 'other-user',
    uploaderName: 'Jane Reader',
    createdAt: '2024-10-19T16:00:00Z'
  },
  {
    id: '6',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    category: 'Self-Help',
    imageUrl: 'https://images.unsplash.com/photo-1664222845171-f9ffe4579c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2R1Y3Rpdml0eSUyMGJvb2t8ZW58MXx8fHwxNzYyMjQ3Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 14.99,
    aiSummary: 'A comprehensive guide to habit formation based on scientific research. Clear presents a practical framework for making tiny changes that lead to remarkable results. The book emphasizes that small, consistent improvements compound over time, and provides strategies for making good habits inevitable and bad habits impossible.',
    uploaderId: 'other-user',
    uploaderName: 'Jane Reader',
    createdAt: '2024-10-20T12:30:00Z'
  }
];

export const categories = [
  'All',
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Self-Help',
  'Biography',
  'History'
];
