// Category to MaterialIcons mapping for merchant map markers
export const CATEGORY_ICONS: Record<string, string> = {
  // Food & Dining
  'Food & Drinks': 'restaurant',
  'Coffee Shop': 'local-cafe',
  'Restaurant': 'restaurant',
  'Fast Food': 'fastfood',
  'Bar': 'local-bar',
  'Bakery': 'bakery-dining',
  
  // Retail & Shopping
  'Electronics': 'devices',
  'Retail': 'shopping-bag',
  'Gift Cards': 'card-giftcard',
  'Marketplace': 'storefront',
  'Online Store': 'shopping-cart',
  'Clothing': 'checkroom',
  'Home & Garden': 'home',
  'Books': 'menu-book',
  'Pharmacy': 'local-pharmacy',
  
  // Technology & Services
  'Tech Services': 'computer',
  'IT Services': 'settings',
  'Software': 'code',
  'Hosting': 'cloud',
  'Telecommunications': 'phone',
  'Internet': 'wifi',
  
  // Transportation & Automotive
  'Transportation': 'directions-car',
  'Automotive': 'directions-car',
  'Car Rental': 'car-rental',
  'Gas Station': 'local-gas-station',
  'Parking': 'local-parking',
  
  // Travel & Accommodation
  'Travel': 'flight',
  'Accommodation': 'hotel',
  'Hotel': 'hotel',
  'Tourism': 'luggage',
  
  // Professional Services
  'Services': 'business',
  'Marketing': 'campaign',
  'Media': 'movie',
  'Consulting': 'support-agent',
  'Legal': 'gavel',
  'Finance': 'account-balance',
  'Insurance': 'security',
  
  // Health & Beauty
  'Health': 'local-hospital',
  'Beauty': 'face',
  'Fitness': 'fitness-center',
  'Spa': 'spa',
  
  // Entertainment & Leisure
  'Entertainment': 'movie',
  'Gaming': 'sports-esports',
  'Sports': 'sports-basketball',
  'Music': 'music-note',
  'Art': 'palette',
  
  // Education & Learning
  'Education': 'school',
  'Training': 'laptop-mac',
  'Library': 'local-library',
  
  // Default fallback
  'Other': 'store',
  'Unknown': 'help-outline'
};

// Get icon for a category, with fallback
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
}

// Get all available categories
export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_ICONS).filter(cat => cat !== 'Other' && cat !== 'Unknown');
}

// Category color mapping for different themes (optional)
export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drinks': '#FF6B35',
  'Coffee Shop': '#8B4513',
  'Restaurant': '#FF4444',
  'Electronics': '#2196F3',
  'Tech Services': '#9C27B0',
  'Transportation': '#4CAF50',
  'Travel': '#FF9800',
  'Services': '#607D8B',
  'Health': '#E91E63',
  'Entertainment': '#3F51B5',
  'Education': '#795548',
  'Other': '#9E9E9E'
}; 