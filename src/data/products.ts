export interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  volume: string;
  bgUrl?: string;
  bgPosition?: string;
  icon?: string;
  type: 'image' | 'icon';
}

export const allProducts: Product[] = [
  {
    id: 1,
    category: 'Vodka',
    name: '8848 Premium Vodka',
    price: 'रू 2,200',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmRYCJuGyE40jVct427zTtANBQZKMt4NCbz11WEhx6HEE9543gB5-9oZdsEdA70oWxZ6Sjd1eGMwnywnFvEQ3EY20S49N-IESF52eOTHBPoeELYkqFZ6Xovz1FtvAI0PJ1Laymbbzi_LAF12hwG0Fwnq9omUvOtvmymLxfSleO0pQUdyXsSlMrYIfbg2s5vZX8mPDnmKmXA_ySovZi4vvM6Mf7cBpsb0jASeWT-J3ijs_9ZHXDq97',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 2,
    category: 'Rum',
    name: 'Khukuri XXX Rum',
    price: 'रू 1,850',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFCorgSAiCCKxziqu3ZtiQm_9_52RmQW1OkrhR-Xq24xbbPJflQNVjsdCK2IzX0FtTciq1nVT-7sfldSMWwoYD2IVVFeNkOk3OF6EGjUCcVO1Az2W21HzUjiix4yZcmG-AATVhDF2JMIthPGi8S0PENc18cLG_6ynBL5BUHa27aC-b0uCk_S_kT1Xzl09l6NJS2t4VtACjsbgDZ5SEmJ14vMD0ILS-EjJL83JkDsLDxpD8yZqcTWbE',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 3,
    category: 'Vodka',
    name: 'Ruslan Vodka',
    price: 'रू 1,400',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJm86E1tLSppraf2oUixf2Pa5gb5jZ1jtXZYv47EjqyEIboB89kk2l60gnFPkal_RoqU85OIOLxCNzBeTwyQtycajAPLiMkdwo0JQYLu28L_UVwFUOYqhpIbNIwpJlzEw3bHqkVtCXEwTDVxoPLf2G52SzZA-csLFh2sfM630O7g1l9v4pQGpq1pJ8z-5dGA0qQVk_6J0obDg1go3Bm35hU8bbACMr0kajflgis0a8w-Mt6Qmbl4RD',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 4,
    category: 'Wine',
    name: 'Highland Reserve White',
    price: 'रू 2,800',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgu9c_Q4QGwZI5BGq_QtNhM594vJDCNLNTjyrcSPNNykKBmSBsaPZEyDIBu5cC_jbySnpKw3jDWzuS7WjLKhJcG_O01-FRML6oWnHR0y-QgoKggWmjBdVMzGlftUk9_Hb1B-yKkbN6yNjhmsWmVoWV7iyayHqn7JsW772-qmAeT9FSN6i7VQdkIBz1bJtRt0ZwHE9ZprhYXkKMmiI2bQeBmGcSFqQLRkQrGsHvNdq0iekqkoGCt_O',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 5,
    category: 'Whisky',
    name: 'Old Durbar Black',
    price: 'रू 3,450',
    volume: '750 ML',
    icon: 'liquor',
    type: 'icon',
  },
  { id: 6, category: 'Whisky', name: 'Glenfiddich 12 Year', price: 'रू 8,500', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 7, category: 'Whisky', name: 'Johnnie Walker Black', price: 'रू 5,200', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 8, category: 'Gin', name: 'Bombay Sapphire', price: 'रू 4,800', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 9, category: 'Gin', name: 'Hendrick\'s Gin', price: 'रू 6,200', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 10, category: 'Beer', name: 'Nepal Ice Beer', price: 'रू 320', volume: '650 ML', type: 'icon', icon: 'sports_bar' },
  { id: 11, category: 'Beer', name: 'Gorkha Premium Beer', price: 'रू 290', volume: '650 ML', type: 'icon', icon: 'sports_bar' },
  { id: 12, category: 'Wine', name: 'Casillero del Diablo Merlot', price: 'रू 3,200', volume: '750 ML', type: 'icon', icon: 'wine_bar' },
  { id: 13, category: 'Tequila', name: 'Jose Cuervo Gold', price: 'रू 4,100', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 14, category: 'Rum', name: 'Captain Morgan Spiced', price: 'रू 3,600', volume: '750 ML', type: 'icon', icon: 'liquor' },
  { id: 15, category: 'Brandy', name: 'Hennessy VS Cognac', price: 'रू 7,800', volume: '750 ML', type: 'icon', icon: 'liquor' },
];
