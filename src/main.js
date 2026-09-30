import { createWorld, allBodies, anyMoving } from './game/world.js';
import { LEVELS, dailyLevel } from './game/levels.js';
import { stepBodies } from './game/physics.js';
import { createScoreState, scoreExits } from './game/scoring.js';
import { createRenderer } from './game/renderer.js';
import { attachInput } from './game/input.js';
import { loadBest, saveBest, loadProgress, saveLevelSuccess, loadDailyResult, saveDailyResult, tutorialSeen } from './storage.js';
import { renderMenu, renderGame, showResult, showHowTo } from './ui/screens.js';
import { showTutorial } from './ui/tutorial.js';
import { t, languageCode, setLanguage } from './ui/i18n.js';
import { playSound, isMuted, setMuted } from './audio.js';
import './styles/main.css';

const root = document.querySelector('#app');
let mode = 'practice';
let levelIndex = 0;
let customLevel = null;
let currentDaily = null;
let unlockMessage = false;
let hint = '';
let hintUntil = 0;
let lastShot = null;
let world;
let scoreState;
let scores;
let names;
let aim = null;
let renderer;
let inputCleanup;
let gameFinished = false;
let inputLocked = false;
let lastTime = 0;
let accumulator = 0;
let lastImpactAt = 0;
const FIXED_STEP = 1 / 120;

function showMenu() {
  gameFinished = true;
  inputCleanup?.();
  renderMenu(root, {
    best: loadBest(), progress: loadProgress(), dailyResult: loadDailyResult(dailyLevel().date),
    onStart: startGame, onHow: showRules,
    onLanguage: () => { setLanguage(languageCode() === 'ru' ? 'kk' : 'ru'); showMenu(); },
    onMute: () => { setMuted(!isMuted()); showMenu(); }, muted: isMuted(),
  });
  if (!tutorialSeen()) showTutorial(root);
}

function showRules() {
  gameFinished = true;
  inputCleanup?.();
  showHowTo(root, showMenu);
}

function startGame(selectedMode = mode, selectedLevel = 0) {
  mode = selectedMode;
  levelIndex = selectedLevel;
  currentDaily = mode === 'daily' ? dailyLevel() : null;
  customLevel = currentDaily;
  gameFinished = false;
  inputLocked = false;
  world = createWorld(levelIndex, customLevel);
  world.mode = mode;
  world.maxShots = 5;
  world.shotsTaken = 0;
  world.playerShots = mode === 'duel' ? [0, 0] : [0];
  world.currentPlayer = 0;
  scoreState = createScoreState();
  scores = mode === 'duel' ? [0, 0] : [0];
  names = mode === 'duel' ? [t('player1'), t('player2')] : [t('practice')];
  aim = null;
  hint = '';
  hintUntil = 0;
  lastShot = null;
  unlockMessage = false;
  const canvas = renderGame(root, showMenu, () => {
    setMuted(!isMuted());
    const button = root.querySelector('.game-tools .mute-toggle');
    button.textContent = isMuted() ? '◖̸' : '◖))';
    button.setAttribute('aria-label', isMuted() ? t('unmute') : t('mute'));
  }, isMuted());
  renderer = createRenderer(canvas);
  inputCleanup?.();
  inputCleanup = attachInput(canvas, () => ({
    scale: renderer.getScale().scale,
    offsetX: renderer.getScale().offsetX,
    offsetY: renderer.getScale().offsetY,
    canShoot: !inputLocked && !world.roundOver && !gameFinished,
    shooter: world.shooter,
    setAim: (point) => { aim = point; },
    getAim: () => aim,
  }), shoot);
  lastTime = 0;
  requestAnimationFrame(frame);
}

function shoot(point) {
  if (!point || inputLocked || world.roundOver || gameFinished) return;
  const dx = world.shooter.x - point.x;
  const dy = world.shooter.y - point.y;
  const pull = Math.min(Math.hypot(dx, dy), 105);
  if (pull < 8) return;
  const target = world.targets.filter((body) => body.active);
  const centerX = target.reduce((sum, body) => sum + body.x, 0) / Math.max(1, target.length);
  const centerY = target.reduce((sum, body) => sum + body.y, 0) / Math.max(1, target.length);
  const desiredX = centerX - world.shooter.x;
  const desiredY = centerY - world.shooter.y;
  lastShot = { pull, scoreBefore: scoreState.points, actualX: dx, actualY: dy, desiredX, desiredY };
  const factor = 8.2;
  world.shooter.vx = dx / (Math.hypot(dx, dy) || 1) * pull * factor;
  world.shooter.vy = dy / (Math.hypot(dx, dy) || 1) * pull * factor;
  inputLocked = true;
  playSound('throw');
  world.shotsTaken++;
  world.playerShots[world.currentPlayer]++;
  world.settled = false;
}

function frame(time) {
  if (gameFinished) return;
  if (!lastTime) lastTime = time;
  accumulator += Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  while (accumulator >= FIXED_STEP) {
    if (anyMoving(world)) {
      const activeTargets = world.targets.filter((body) => body.active);
      const impacts = stepBodies(allBodies(world), FIXED_STEP, world.level);
      if (impacts.length && performance.now() - lastImpactAt > 90) {
        renderer.impact(impacts[0]);
        playSound('hit');
        lastImpactAt = performance.now();
      }
      const pointsBefore = scoreState.points;
      scoreExits(world, scoreState);
      const gainedNow = scoreState.points - pointsBefore;
      scores[world.currentPlayer] += gainedNow;
      if (gainedNow) {
        for (const target of activeTargets) if (!target.active) renderer.scoreEffect(target);
        playSound('score');
      }
      if (!anyMoving(world)) {
        world.settled = true;
        // Clear tiny residual velocities so the next throw always becomes available.
        for (const body of allBodies(world)) {
          body.vx = 0;
          body.vy = 0;
        }
        if (lastShot) {
          const gained = scoreState.points - lastShot.scoreBefore;
          if (gained) hint = `${t('hintGreat')} +${gained} ${t(gained === 1 ? 'point' : 'points')}`;
          else if (lastShot.pull < 52) hint = t('weak');
          else if (lastShot.pull > 83) hint = t('strong');
          else {
            const cross = lastShot.actualX * lastShot.desiredY - lastShot.actualY * lastShot.desiredX;
            hint = cross > 0 ? t('right') : t('left');
          }
          hintUntil = performance.now() + 2600;
          lastShot = null;
        }
        // Сақа возвращается на линию, когда все асыки остановились.
        // Так каждый следующий бросок можно начать в одной и той же точке.
        world.shooter.x = 0;
        world.shooter.y = world.level.playerLine;
        world.shooter.vx = 0;
        world.shooter.vy = 0;
        inputLocked = false;
        if (world.playerShots.every((count) => count >= world.maxShots)) {
          world.roundOver = true;
          finishGame();
        } else if (mode === 'duel') {
          const next = 1 - world.currentPlayer;
          if (world.playerShots[next] < world.maxShots) world.currentPlayer = next;
        }
      }
    }
    accumulator -= FIXED_STEP;
  }
  if (!gameFinished) {
    renderer.draw({ world, score: scores[world.currentPlayer] ?? scoreState.points, best: loadBest(), aim, strength: aim ? Math.min(100, Math.hypot(world.shooter.x - aim.x, world.shooter.y - aim.y) / 105 * 100) : 0, playerNames: names, playerShots: world.playerShots, hint: performance.now() < hintUntil ? hint : '' });
    requestAnimationFrame(frame);
  }
}

function finishGame() {
  gameFinished = true;
  playSound('victory');
  const best = saveBest(Math.max(...scores));
  if (mode !== 'duel' && scores[0] >= 3 && !currentDaily) {
    const oldUnlocked = loadProgress().unlocked;
    const progress = saveLevelSuccess(levelIndex);
    unlockMessage = progress.unlocked > oldUnlocked;
  }
  const dailyResult = currentDaily ? saveDailyResult(currentDaily.date, scores[0]) : null;
  const shareText = currentDaily ? `${t('dailyShare')} ${currentDaily.date}\n${t('challenge')}: ${scores[0]}/${world.targets.length}. ${t('challengeTail')}` : '';
  showResult(root, { scores, names, best, total: world.targets.length, mode, onAgain: () => startGame(mode, levelIndex), onMenu: showMenu, unlocked: unlockMessage, daily: dailyResult, shareText });
}

showMenu();
