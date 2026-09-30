export function createScoreState() {
  return { scoredIds: new Set(), points: 0 };
}

export function scoreExits(world, scoreState) {
  for (const body of world.targets) {
    if (!body.active && !scoreState.scoredIds.has(body.id)) {
      scoreState.scoredIds.add(body.id);
      scoreState.points += 1;
    }
  }
}

export function getTitle(points, total) {
  if (points === total) return 'Шебер';
  if (points >= 3) return 'Мергенді';
  if (points >= 1) return 'Новичок';
  return 'Попробуй ещё';
}
