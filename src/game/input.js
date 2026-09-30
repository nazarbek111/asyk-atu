export function attachInput(canvas, getContext, onShoot) {
  let dragging = false;
  let pointerId = null;
  let dragOrigin = null;
  let sakaOrigin = null;
  const position = (event) => {
    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = getContext();
    return { x: (event.clientX - rect.left - offsetX) / scale - 300, y: (event.clientY - rect.top - offsetY) / scale - 350 };
  };
  const down = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const context = getContext();
    if (!context.canShoot) return;
    const p = position(event);
    // Let the player start on the saka or anywhere in the lower slingshot zone.
    // The gesture displacement is applied to the saka, so touch layout does not
    // depend on the exact visible hitbox size.
    if (Math.hypot(p.x - context.shooter.x, p.y - context.shooter.y) > 85 && p.y < context.shooter.y - 45) return;
    event.preventDefault();
    dragging = true;
    pointerId = event.pointerId;
    dragOrigin = p;
    sakaOrigin = { x: context.shooter.x, y: context.shooter.y };
    canvas.setPointerCapture?.(pointerId);
    context.setAim(sakaOrigin);
  };
  const move = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    event.preventDefault();
    const p = position(event);
    getContext().setAim({ x: sakaOrigin.x + p.x - dragOrigin.x, y: sakaOrigin.y + p.y - dragOrigin.y });
  };
  const up = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    event.preventDefault();
    dragging = false;
    pointerId = null;
    dragOrigin = null;
    sakaOrigin = null;
    const context = getContext();
    const aim = context.getAim();
    if (aim) onShoot(aim);
    context.setAim(null);
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
  };
}
