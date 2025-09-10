// Spotlight utilities and functions
export interface SpotlightItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  isActive: boolean;
  link: string;
  buttonText: string;
}

// Format price with Vietnamese currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Format date to Vietnamese format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get level badge color
export const getLevelBadgeColor = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get access badge color
export const getAccessBadgeColor = (access: string): string => {
  switch (access) {
    case 'free':
      return 'bg-green-100 text-green-800';
    case 'premium':
      return 'bg-blue-100 text-blue-800';
    case 'pro':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Pick random spotlight item
export const pickSpotlight = (items: SpotlightItem[]): SpotlightItem | null => {
  const activeItems = items.filter(item => item.isActive);
  if (activeItems.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * activeItems.length);
  return activeItems[randomIndex];
};
