const API_KEYS = {
  PEXELS: process.env.EXPO_PUBLIC_PEXELS_API_KEY || "",
  UNSPLASH: process.env.EXPO_PUBLIC_UNSPLASH_API_KEY || ""
};

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

  // --- STAGE 1: UNSPLASH PHOTOGRAPHY STREAM ---
  // FIXED: Checked against the exact property key declared in API_KEYS
  if (API_KEYS.UNSPLASH && API_KEYS.UNSPLASH !== 'YOUR_UNSPLASH_ACCESS_KEY_HERE') {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodedWord}&per_page=3`, {
        headers: { 'Authorization': `Client-ID ${API_KEYS.UNSPLASH}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length >= 3) {
          console.log(`[Media Engine] Success: Captured Unsplash photography vector cluster.`);
          return data.results.map(item => item.urls.small || item.urls.regular);
        }
      }
    } catch (err) {
      console.log(`[Media Engine] Unsplash pipeline skipped: ${err.message}`);
    }
  }

  // --- STAGE 2: PEXELS STOCK PHOTOGRAPHY INTERPOLATION ---
  // FIXED: Checked against the exact property key declared in API_KEYS
  if (API_KEYS.PEXELS && API_KEYS.PEXELS !== 'YOUR_PEXELS_API_KEY_HERE') {
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodedWord}&per_page=3`, {
        headers: { 'Authorization': API_KEYS.PEXELS }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length >= 3) {
          console.log(`[Media Engine] Success: Captured Pexels stock asset clusters.`);
          return data.photos.map(photo => photo.src.medium || photo.src.large);
        }
      }
    } catch (err) {
      console.log(`[Media Engine] Pexels pipeline skipped: ${err.message}`);
    }
  }

  // --- STAGE 3: WIKIMEDIA COMMONS UPGRADED FUZZY SEARCH (True 3-Image Array) ---
  // UPGRADED: Changed gsrlimit to 3 and mapped individual files so the carousel moves through 3 unique slides
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodedWord}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*&gsrlimit=3`;
    const response = await fetch(wikiUrl);
    const data = await response.json();
    
    if (data?.query?.pages) {
      const pages = data.query.pages;
      const urls = Object.keys(pages)
        .map(key => pages[key].imageinfo?.[0]?.url)
        .filter(Boolean);

      if (urls.length > 0) {
        console.log(`[Media Engine] Success: Captured Wikimedia asset vector links.`);
        // Pad the array if less than 3 unique images are found to keep the carousel safe
        while (urls.length < 3) {
          urls.push(urls[0]);
        }
        return urls;
      }
    }
  } catch (err) {
    console.log(`[Media Engine] Wikimedia pipeline skipped: ${err.message}`);
  }

  // --- STAGE 4: FIXED ABSOLUTE SAFE CAROUSEL ARRAY FALLBACK ---
  // FIXED: Instead of returning an object containing strings (which breaks image arrays),
  // we return 3 safe placeholder vector graphic imagery links so the app never crashes.
  console.log(`[Media Engine] Dropback Warning: Network keys missing/exhausted. Generating vector fallbacks.`);
  return [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
  ];
}