// Local thematic Word Bank
export const WORD_BANK = {
  ANIMALS: [
    { civilian: 'Lion', infiltrator: 'Tiger' },
    { civilian: 'Dolphin', infiltrator: 'Whale' },
    { civilian: 'Eagle', infiltrator: 'Hawk' },
    { civilian: 'Alligator', infiltrator: 'Crocodile' }
  ],
  FOOD: [
    { civilian: 'Apple', infiltrator: 'Pear' },
    { civilian: 'Pizza', infiltrator: 'Burger' },
    { civilian: 'Coffee', infiltrator: 'Tea' },
    { civilian: 'Ice Cream', infiltrator: 'Yogurt' }
  ],
  PLACES: [
    { civilian: 'Castle', infiltrator: 'Palace' },
    { civilian: 'Desert', infiltrator: 'Beach' },
    { civilian: 'Hospital', infiltrator: 'Clinic' },
    { civilian: 'School', infiltrator: 'College' }
  ]
};

// Sequential image extraction engine: Wikimedia -> Local Fallback Emoji
export async function fetchWordImages(word, category) {
  try {
    // 1. Primary Fetch: Wikimedia API (No keys required, reliable open source public source)
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&titles=${encodeURIComponent(word)}&pithumbsize=400&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    
    const pages = data?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId]?.thumbnail?.source;
      if (thumbnail) {
        // Return duplicate URLs or single URL array for our carousel layout mapping
        return [thumbnail, thumbnail, thumbnail];
      }
    }
  } catch (error) {
    console.log("Image API pipeline failed, dropping back to category icons:", error);
  }

  // 2. Absolute Fallback: Category Emoji Systems if network drops/timeouts clear out
  const categoryEmojis = { ANIMALS: '🦁', FOOD: '🍕', PLACES: '🏰' };
  return {
    isFallback: true,
    emoji: categoryEmojis[category] || '📦',
    categoryName: category
  };
}