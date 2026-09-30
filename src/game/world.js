import { LEVELS } from './levels.js';

const makeBody = (id, x, y, radius, isShooter = false) => ({ id, x, y, radius, vx: 0, vy: 0, active: true, isShooter });

export function createWorld(levelIndex = 0, customLevel = null) {
  const level = customLevel || LEVELS[levelIndex];
  const targets = level.targets.map((p, i) => makeBody(`target-${i}`, p.x, p.y, 13));
  return {
    level,
    targets,
    shooter: makeBody('saka', 0, level.playerLine, 17, true),
    shotsTaken: 0,
    maxShots: 5,
    currentPlayer: 0,
    mode: 'practice',
    roundOver: false,
    settled: true,
  };
}

export function allBodies(world) { return [world.shooter, ...world.targets]; }
export function anyMoving(world) {
  // Match the velocity cutoff used by physics so a shot cannot be re-armed
  // while an asyk still has a small residual drift.
  // Ejected asyks are inactive and no longer simulated, so their last velocity
  // must not keep the round locked forever.
  return allBodies(world).some((body) => body.active && Math.hypot(body.vx, body.vy) >= 4);
}
