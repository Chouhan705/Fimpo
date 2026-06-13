import { EXTENDED_WORD_BANK } from './wordBankData';

// Fallback Category Emojis mapping structure
const CATEGORY_EMOJIS = {
  "Around the House": '🏠',
  "Global Landmarks & Travel": '✈️',
  "Food & Drinks": '🍔',
  "Occupations & Professions": '💼',
  "Animals & Nature": '🦁',
  "Entertainment & Pop Culture": '🎬',
  "Sports & Hobbies": '⚽',
  "Clothing & Fashion": '🕶️',
  "Technology & Modern Life": '🤖',
  "History, Myth & Fantasy": '🐉'
};

export async function fetchWordImages(word, category) {
  try {
    // Primary Pipeline: Query open source Wikimedia API asset engine
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&titles=${encodeURIComponent(word)}&pithumbsize=400&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    
    const pages = data?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId]?.thumbnail?.source;
      if (thumbnail) {
        return [thumbnail, thumbnail, thumbnail];
      }
    }
  } catch (error) {
    console.log("Image pipeline fallback initiated:", error);
  }

  // Final Absolute Offline Fallback
  return {
    isFallback: true,
    emoji: CATEGORY_EMOJIS[category] || '📦',
    categoryName: category
  };
}