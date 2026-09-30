import { t } from './i18n.js';

export function renderMenu(root, { best, progress, dailyResult, onStart, onHow, onLanguage, onMute, muted }) {
  const stages = t('stageNames');
  root.innerHTML = `<main class="menu-screen screen-enter"><div class="ornament-frame" aria-hidden="true"></div><div class="menu-noise"></div><header class="brand"><span class="brand-mark">ᚫ</span><span>${t('brand')}</span><div class="menu-tools"><button class="language-toggle" aria-label="${t('switchLang')}">${t('switchLang')}</button><button class="mute-toggle" aria-label="${muted ? t('unmute') : t('mute')}">${muted ? '◖̸' : '◖))'}</button></div></header><section class="menu-copy"><p class="eyebrow">${t('eyebrow')}</p><h1>Асық<br><em>ату</em></h1><p class="intro">${t('intro')}</p><div class="best-line"><span class="best-dot"></span> ${t('best')} <b>${best}</b></div><div class="menu-actions"><button class="primary" data-mode="practice">${t('practice')} <span>↗</span></button><button class="secondary" data-mode="duel">${t('duel')} <span>＋</span></button><button class="secondary daily-button" data-mode="daily">${t('daily')} <span>✳</span></button><button class="text-button how-button">${t('how')}</button></div><div class="level-picker"><div class="level-caption">${t('levels')} <span>${progress.unlocked + 1} / 5 ${t('open')}</span></div><div class="level-list">${stages.map((name, i) => `<button class="level-choice ${i === 0 ? 'selected' : ''}" data-level="${i}" ${i > progress.unlocked ? 'disabled' : ''} title="${i > progress.unlocked ? t('locked') : name}"><span>${String(i + 1).padStart(2, '0')}</span>${name}${progress.completed.includes(i) ? '<b>✓</b>' : i > progress.unlocked ? '<b>•</b>' : ''}</button>`).join('')}</div><p class="level-hint">${t('unlockHint')}</p></div></section><div class="menu-foot"><span>${t('footer1')}</span><span>${t('footer2')}</span></div><div class="ornament">✳</div></main>`;
  let selectedLevel = 0;
  root.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => {
    root.querySelector('.level-choice.selected')?.classList.remove('selected');
    button.classList.add('selected'); selectedLevel = Number(button.dataset.level);
  }));
  root.querySelector('[data-mode="practice"]').addEventListener('click', () => onStart('practice', selectedLevel));
  root.querySelector('[data-mode="duel"]').addEventListener('click', () => onStart('duel', selectedLevel));
  root.querySelector('[data-mode="daily"]').addEventListener('click', () => onStart('daily'));
  root.querySelector('.how-button').addEventListener('click', onHow);
  root.querySelector('.language-toggle').addEventListener('click', onLanguage);
  root.querySelector('.mute-toggle').addEventListener('click', onMute);
  if (dailyResult) root.querySelector('.daily-button').classList.add('has-result');
}

export function showHowTo(root, onBack) {
  const headline = t('rulesHeadline').split('|');
  root.innerHTML = `<main class="how-screen screen-enter"><button class="back-button how-back">${t('howBack')}</button><section class="how-content"><p class="eyebrow">${t('rulesTitle')}</p><h1>${headline[0]}<br><em>${headline[1]}</em></h1><div class="rule-list">${t('rules').map(([title, text], i) => `<article><span>0${i + 1}</span><div><h2>${title}</h2><p>${text}</p></div></article>`).join('')}</div><button class="primary how-start">${t('understood')} <span>↗</span></button></section></main>`;
  root.querySelector('.how-back').addEventListener('click', onBack);
  root.querySelector('.how-start').addEventListener('click', onBack);
}

export function renderGame(root, onMenu, onMute, muted) {
  root.innerHTML = `<main class="game-screen screen-enter"><div class="ornament-frame" aria-hidden="true"></div><header class="game-header"><button class="back-button" aria-label="${t('back')}">←</button><div class="game-title"><span class="tiny-mark">ᚫ</span><span>АСЫҚ АТУ</span></div><div class="game-tools"><span class="gesture-hint">${t('drag')} <span>↙</span></span><button class="mute-toggle" aria-label="${muted ? t('unmute') : t('mute')}">${muted ? '◖̸' : '◖))'}</button></div></header><section class="playfield"><canvas aria-label="${t('field')}"></canvas><div class="mobile-tip">${t('mobileTip')}</div></section><footer class="game-footer"><span>${t('drag')}</span><span class="footer-dot">✳</span><span>${t('footer2')}</span></footer></main>`;
  root.querySelector('.back-button').addEventListener('click', onMenu);
  root.querySelector('.mute-toggle').addEventListener('click', onMute);
  return root.querySelector('canvas');
}

export function showResult(root, { scores, names, best, total, mode, onAgain, onMenu, unlocked = false, daily = null, shareText = '' }) {
  const winner = scores.indexOf(Math.max(...scores));
  const rows = scores.map((score, i) => `<div class="score-row ${i === winner && mode === 'duel' ? 'winner' : ''}"><span>${names[i]}</span><b>${score}<small> / ${total}</small></b></div>`).join('');
  const heading = mode === 'duel' && scores[0] !== scores[1] ? `${t('winner')} — ${names[winner]}` : (scores[0] === total ? t('spotless') : t('good'));
  root.insertAdjacentHTML('beforeend', `<div class="result-shade"><section class="result-card result-enter"><button class="result-close" aria-label="${t('back')}">×</button><div class="result-seal">✳</div><p class="eyebrow">${daily ? `${t('dailyLabel')} · ${daily.date}` : t('roundOver')}</p><h2>${heading}</h2><p class="result-sub">${mode === 'duel' ? t('meeting') : t('yourResult')}</p><div class="score-list">${rows}</div><div class="title-badge">${mode === 'duel' ? t('marksman') : titleFor(scores[0], total)}</div>${unlocked ? `<p class="unlocked-note">${t('nextUnlocked')}</p>` : ''}<p class="best-result">${t('personalBest')} <b>${best}</b>${daily ? ` · ${t('todayBest')} <b>${daily.score}</b>` : ''}</p>${daily ? `<button class="secondary share-result">${t('share')}</button>` : ''}<button class="primary result-again">${t('playAgain')} <span>↗</span></button><button class="text-button result-menu">${t('back')}</button></section></div>`);
  root.querySelector('.result-close').addEventListener('click', onMenu);
  root.querySelector('.result-menu').addEventListener('click', onMenu);
  root.querySelector('.result-again').addEventListener('click', onAgain);
  root.querySelector('.share-result')?.addEventListener('click', async (event) => {
    try { await navigator.clipboard.writeText(shareText); event.currentTarget.textContent = t('copied'); }
    catch { event.currentTarget.textContent = t('copyFailed'); }
  });
}

function titleFor(score, total) {
  if (score === total) return t('perfect');
  if (score >= 3) return t('marksman');
  if (score >= 1) return t('beginner');
  return t('tryAgain');
}
