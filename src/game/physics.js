const RESTITUTION = 0.72;

export function stepBodies(bodies, dt, bounds) {
  const impacts = [];
  for (const body of bodies) {
    if (!body.active) continue;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    const friction = Math.exp(-1.35 * dt);
    body.vx *= friction;
    body.vy *= friction;
    if (Math.hypot(body.vx, body.vy) < 4) body.vx = body.vy = 0;
  }

  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i];
    if (!a.active) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j];
      if (!b.active) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.001;
      const minDistance = a.radius + b.radius;
      if (distance >= minDistance) continue;
      impacts.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const nx = dx / distance;
      const ny = dy / distance;
      const overlap = minDistance - distance;
      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;
      const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (relative < 0) {
        const impulse = -(1 + RESTITUTION) * relative / 2;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
      }
    }
  }

  for (const body of bodies) {
    if (!body.active || body.isShooter) continue;
    const distance = Math.hypot(body.x, body.y);
    if (distance - body.radius > bounds.radius) body.active = false;
  }
  return impacts;
}
