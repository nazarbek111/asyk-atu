const W = 600;
const H = 700;
import { t } from '../ui/i18n.js';
import { LEVELS } from './levels.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1, offsetX = 0, offsetY = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    scale = Math.min(rect.width / W, rect.height / H);
    offsetX = (rect.width - W * scale) / 2;
    offsetY = (rect.height - H * scale) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
  };
  const particles = [];
  const popups = [];
  let lastEffectTime = 0;
  const emitDust = (x, y, count = 9) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 65;
      particles.push({ x: 300 + x, y: 350 + y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 15, life: 0.32 + Math.random() * 0.35, max: 0.67, size: 2 + Math.random() * 4 });
    }
  };
  const impact = (point) => {
    emitDust(point.x, point.y, 7);
    canvas.parentElement.classList.remove('shake');
    void canvas.parentElement.offsetWidth;
    canvas.parentElement.classList.add('shake');
  };
  const scoreEffect = (point) => {
    emitDust(point.x, point.y, 18);
    popups.push({ x: 300 + point.x, y: 350 + point.y, life: 0.9, max: 0.9 });
  };
  window.addEventListener('resize', resize);
  resize();
  const drawAsyk = (body, shooter = false) => {
    if (!body.active) return;
    ctx.save();
    ctx.translate(300 + body.x, 350 + body.y);
    ctx.rotate(shooter ? -0.35 : ((Number(body.id.at(-1)) || 0) - 3) * 0.18);
    const r = body.radius * (shooter ? 1.23 : 1.12);
    ctx.shadowColor = 'rgba(65, 39, 19, .38)';
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = shooter ? '#b87936' : '#aa7950';
    ctx.beginPath();
    ctx.moveTo(-r * .32, -r * .82);
    ctx.quadraticCurveTo(-r * .82, -r * 1.1, -r * .88, -r * .58);
    ctx.quadraticCurveTo(-r * 1.02, -r * .27, -r * .62, -r * .08);
    ctx.quadraticCurveTo(-r * .9, r * .24, -r * .68, r * .6);
    ctx.quadraticCurveTo(-r * .48, r * 1.08, -r * .12, r * .78);
    ctx.quadraticCurveTo(0, r * .68, r * .14, r * .79);
    ctx.quadraticCurveTo(r * .54, r * 1.08, r * .72, r * .58);
    ctx.quadraticCurveTo(r * .92, r * .22, r * .62, -r * .08);
    ctx.quadraticCurveTo(r * 1.02, -r * .3, r * .72, -r * .59);
    ctx.quadraticCurveTo(r * .64, -r * 1.1, r * .29, -r * .82);
    ctx.quadraticCurveTo(0, -r * .67, -r * .32, -r * .82);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = shooter ? '#e8c16d' : '#d8bd93';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.15, r * 0.28, r * 0.52, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shooter ? '#78502c' : '#806045';
    ctx.beginPath();
    ctx.arc(r * 0.28, r * 0.16, r * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function draw({ world, score, best, aim, strength = 0, playerNames = [], playerShots = [], hint = '' }) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#59402b'); bg.addColorStop(1, '#39291e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(230, 198, 132, .12)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 137 + 29) % W, y = (i * 211 + 43) % H;
      ctx.beginPath(); ctx.arc(x, y, i % 3 === 0 ? 2 : 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#9a6339'; ctx.beginPath(); ctx.arc(300, 350, 253, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9ad70'; ctx.beginPath(); ctx.arc(300, 350, 246, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(300, 350, 241, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#d5b984'; ctx.fillRect(55, 105, 490, 490);
    ctx.strokeStyle = 'rgba(116, 69, 35, .17)'; ctx.lineWidth = 1;
    for (let y = 120; y < 590; y += 22) { ctx.beginPath(); ctx.moveTo(65, y); ctx.lineTo(535, y + 8); ctx.stroke(); }
    for (let x = 80; x < 530; x += 33) { ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x - 18, 590); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(92, 60, 30, .72)'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
    ctx.beginPath(); ctx.arc(300, 350, 115, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(112, 66, 35, .68)'; ctx.fillRect(76, 570, 448, 2);
    ctx.fillStyle = '#754b2d'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(t('line'), 300, 590);
    world.targets.forEach((body) => drawAsyk(body));

    if (aim && world.shooter.active) {
      const sx = 300 + world.shooter.x, sy = 350 + world.shooter.y;
      const dx = sx - (300 + aim.x), dy = sy - (350 + aim.y);
      const length = Math.hypot(dx, dy);
      const nx = dx / (length || 1), ny = dy / (length || 1);
      ctx.save(); ctx.setLineDash([7, 8]); ctx.strokeStyle = '#fff7d9'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + nx * (80 + strength * 1.3), sy + ny * (80 + strength * 1.3)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#fff7d9'; ctx.beginPath(); ctx.arc(sx + nx * 100, sy + ny * 100, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(75, 47, 28, .78)'; ctx.roundRect(205, 74, 190, 12, 6); ctx.fill();
      ctx.fillStyle = strength > 72 ? '#c46d49' : '#d9a94f'; ctx.roundRect(205, 74, 190 * strength / 100, 12, 6); ctx.fill();
    }
    drawAsyk(world.shooter, true);

    const now = performance.now();
    const effectDt = Math.min(0.05, lastEffectTime ? (now - lastEffectTime) / 1000 : 0);
    lastEffectTime = now;
    for (const item of particles) {
      item.life -= effectDt;
      item.x += item.vx * effectDt; item.y += item.vy * effectDt;
      item.vy += 85 * effectDt;
      if (item.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, item.life / item.max) * .6;
      ctx.fillStyle = '#9c7049'; ctx.beginPath(); ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const popup of popups) {
      popup.life -= effectDt; popup.y -= 28 * effectDt;
      if (popup.life <= 0) continue;
      ctx.globalAlpha = Math.min(1, popup.life / .2);
      ctx.fillStyle = '#fff0bc'; ctx.font = '700 21px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+1', popup.x, popup.y);
    }
    ctx.globalAlpha = 1;
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
    for (let i = popups.length - 1; i >= 0; i--) if (popups[i].life <= 0) popups.splice(i, 1);

    const knownLevel = LEVELS.findIndex((level) => level.id === world.level.id);
    const levelName = knownLevel >= 0 ? t('stageNames')[knownLevel] : `${t('daily')} · ${world.level.date || ''}`;
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5e9cc'; ctx.font = '700 12px system-ui'; ctx.fillText(levelName.toUpperCase(), 28, 34);
    ctx.textAlign = 'right'; ctx.fillStyle = '#e4caa0'; ctx.font = '12px system-ui'; ctx.fillText(`${t('bestShort')} ${best}`, 572, 34);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f5e9cc'; ctx.font = '700 14px system-ui';
    const name = playerNames[world.currentPlayer] || 'Тренировка';
    ctx.fillText(name, 300, 47);
    if (hint) {
      ctx.fillStyle = 'rgba(67, 44, 28, .92)'; ctx.beginPath(); ctx.roundRect(162, 93, 276, 30, 15); ctx.fill();
      ctx.fillStyle = '#f4e3bd'; ctx.font = '600 11px system-ui'; ctx.fillText(hint, 300, 112);
    }
    ctx.fillStyle = '#f3e2bd'; ctx.font = '600 14px system-ui'; ctx.fillText(`${t('score')}  ${score}`, 300, 632);
    ctx.fillStyle = '#e2c89c'; ctx.font = '12px system-ui'; ctx.fillText(`${t('shots')}  ${Math.min(playerShots[world.currentPlayer] + (aim ? 1 : 0), world.maxShots)} / ${world.maxShots}`, 300, 654);
  }
  return { draw, resize, impact, scoreEffect, getScale: () => ({ scale, offsetX, offsetY }) };
}
