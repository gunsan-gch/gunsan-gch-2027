/* Pure score/wardrobe rules. No storage writes or game rewards happen here. */
(() => {
  const TITLE_AT = 27;
  const TITLE = '별빛 학교 탐험가';
  function normalizeStars(value, max = 3) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    if (value > max) value = Math.round(value * max / 9); // former nine-star games
    return Math.max(0, Math.min(max, Math.floor(value)));
  }
  const pointsOrNull = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
  function stampRecord(previous, stars, max, points, date) {
    const earned = normalizeStars(stars, max);
    const record = { ...previous };
    if (!previous || earned > previous.stars) {
      record.stars = earned;
      record.at = date;
    }
    const pointsThisRun = pointsOrNull(points);
    if (pointsThisRun !== null) {
      record.bestScore = Math.max(pointsThisRun, pointsOrNull(previous?.bestScore) ?? 0);
    }
    return record;
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
  const slots = ['head', 'back', 'face', 'trail'];
  function loadEquip(saved, items) {
    return Object.fromEntries(slots.map(slot => {
      const id = saved?.[slot];
      return [slot, items.some(item => item.slot === slot && item.id === id) ? id : null];
    }));
  }
  const emptyWardrobe = () => ({ version: 2, unlocked: [], title: false });
  window.TourStarProgress = { normalizeStars, pointsOrNull, stampRecord, summarize, wardrobe, emptyWardrobe, loadEquip, slots, TITLE_AT, TITLE };
})();
