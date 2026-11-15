/* Pure score/wardrobe rules. No storage writes or game rewards happen here. */
(() => {
  const TITLE_AT = 27;
  const TITLE = '별빛 학교 탐험가';
  function normalizeStars(value, max = 3) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    if (value > max) value = Math.round(value * max / 9); // former nine-star games
    return Math.max(0, Math.min(max, Math.floor(value)));
  }
  function summarize(stamps, entries) {
    const seen = new Set();
    const games = entries.filter(entry => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id); return true;
    }).map(entry => ({ ...entry, stars: normalizeStars(stamps[entry.id]?.stars, entry.maxStars),
      played: !!stamps[entry.id] }));
    return { games, stars: games.reduce((sum, game) => sum + game.stars, 0),
      maxStars: games.reduce((sum, game) => sum + game.maxStars, 0),
      count: games.filter(game => game.played).length };
  }
  function wardrobe(saved, progress, items) {
    const migrated = saved?.version === 2;
    const previous = new Set(migrated && Array.isArray(saved.unlocked) ? saved.unlocked : []);
    return { version: 2,
      unlocked: items.filter(item => previous.has(item.id) || item.at <= progress.stars ||
        (!migrated && item.legacyAt && item.legacyAt <= Math.min(8, progress.count))).map(item => item.id),
      title: (migrated && saved.title === true) || progress.stars >= TITLE_AT };
  }
  const emptyWardrobe = () => ({ version: 2, unlocked: [], title: false });
  window.TourStarProgress = { normalizeStars, summarize, wardrobe, emptyWardrobe, TITLE_AT, TITLE };
})();
