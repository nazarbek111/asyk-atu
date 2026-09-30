// Coordinates are relative to the field center. y=220 puts the saka on the
// visible throw line (canvas y=570) and leaves room below it for a full pull.
const level = (id, name, targets) => ({ id, name, radius: 250, playerLine: 220, targetCount: targets.length, targets });

export const LEVELS = [
  level('row', 'Ряд', [-108, -72, -36, 0, 36, 72, 108].map((x) => ({ x, y: -30 }))),
  level('triangle', 'Треугольник', [
    { x: 0, y: -93 }, { x: -34, y: -47 }, { x: 34, y: -47 },
    { x: -68, y: 0 }, { x: 0, y: 0 }, { x: 68, y: 0 }, { x: -34, y: 47 }, { x: 34, y: 47 }, { x: 0, y: 94 },
  ]),
  level('circle', 'Круг', Array.from({ length: 10 }, (_, i) => ({ x: Math.cos(i * Math.PI / 5) * 83, y: Math.sin(i * Math.PI / 5) * 83 }))),
  level('fortress', 'Крепость', [
    { x: -85, y: -76 }, { x: -28, y: -76 }, { x: 28, y: -76 }, { x: 85, y: -76 },
    { x: -85, y: -18 }, { x: 85, y: -18 }, { x: -85, y: 40 }, { x: -28, y: 40 }, { x: 28, y: 40 }, { x: 85, y: 40 },
  ]),
  level('far', 'Дальние мишени', [-140, -93, -46, 0, 46, 93, 140].map((x, i) => ({ x, y: -175 - (i % 2) * 20 }))),
];

export function dailyLevel(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  let seed = [...key].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const targets = [];
  let attempts = 0;
  while (targets.length < 7 && attempts++ < 500) {
    const point = { x: Math.round((random() * 2 - 1) * 145), y: Math.round(-45 - random() * 145) };
    if (targets.every((other) => Math.hypot(point.x - other.x, point.y - other.y) >= 34)) targets.push(point);
  }
  return { ...level(`daily-${key}`, `Испытание · ${key}`, targets), date: key };
}
