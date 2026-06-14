import { API_KEYS } from './apiCredentials';

// Category Emoji configurations for emergency offline fallbacks
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
  const encodedWord = encodeURIComponent(word.toLowerCase().trim());
  console.log(`[Media Engine] Resolving dynamic graphic vectors for target: "${word}"`);

  // --- STAGE 1: WIKIMEDIA COMMONS UPGRADED FUZZY SEARCH ---
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodedWord}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*&gsrlimit=1`;
    const response = await fetch(wikiUrl);
    const data = await response.json();
    
    if (data?.query?.pages) {
      const pages = data.query.pages;
      const firstPageKey = Object.keys(pages)[0];
      const finalImgUrl = pages[firstPageKey].imageinfo[0].url;
      if (finalImgUrl) {
        console.log(`[Media Engine] Success: Captured Wikimedia asset vector link.`);
        return [finalImgUrl, finalImgUrl, finalImgUrl];
      }
    }
  } catch (err) {
    console.log(`[Media Engine] Wikimedia pipeline skipped: ${err.message}`);
  }

  // --- STAGE 2: UNSPLASH PHOTOGRAPHY STREAM (WITH CLIENT ID HEADER) ---
  if (API_KEYS.UNSPLASH_ACCESS_KEY && API_KEYS.UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY_HERE') {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodedWord}&per_page=3`, {
        headers: { 'Authorization': `Client-ID ${API_KEYS.UNSPLASH_ACCESS_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          console.log(`[Media Engine] Success: Captured Unsplash photography vector cluster.`);
          // Extract three unique images to fill out your pass-and-play clue carousel swipe cards!
          return data.results.map(item => item.urls.small || item.urls.regular);
        }
      }
    } catch (err) {
      console.log(`[Media Engine] Unsplash pipeline skipped: ${err.message}`);
    }
  }

  // --- STAGE 3: PEXELS STOCK PHOTOGRAPHY INTERPOLATION (WITH AUTH HEADER) ---
  if (API_KEYS.PEXELS_API_KEY && API_KEYS.PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY_HERE') {
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodedWord}&per_page=3`, {
        headers: { 'Authorization': API_KEYS.PEXELS_API_KEY }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          console.log(`[Media Engine] Success: Captured Pexels stock asset clusters.`);
          return data.photos.map(photo => photo.src.medium || photo.src.large);
        }
      }
    } catch (err) {
      console.log(`[Media Engine] Pexels pipeline skipped: ${err.message}`);
    }
  }

  // --- STAGE 4: ABSOLUTE SAFE OFFLINE THEMATIC EMOJI SYSTEM ---
  console.log(`[Media Engine] Dropback Warning: Network keys missing/exhausted. Generating vector fallbacks.`);
  return {
    isFallback: true,
    emoji: CATEGORY_EMOJIS[category] || '📦',
    categoryName: category
  };
}