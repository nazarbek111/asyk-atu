import { markTutorialSeen } from '../storage.js';
import { t } from './i18n.js';

export function showTutorial(root, onClose) {
  const steps = t('tutorial');
  let step = 0;
  const finish = () => { markTutorialSeen(); root.querySelector('.tutorial-shade')?.remove(); onClose?.(); };
  const paint = () => {
    const item = steps[step];
    root.querySelector('.tutorial-shade')?.remove();
    root.insertAdjacentHTML('beforeend', `<div class="tutorial-shade"><section class="tutorial-card result-enter"><button class="tutorial-skip">${t('skip')}</button><div class="tutorial-number">0${step + 1}<span> / 03</span></div><div class="tutorial-illustration">${step === 0 ? '●　●<br>　●' : step === 1 ? '↙　●' : '●　↗'}</div><h2>${item.title}</h2><p>${item.text}</p><div class="tutorial-bottom"><div class="tutorial-dots">${steps.map((_, i) => `<i class="${i === step ? 'active' : ''}"></i>`).join('')}</div><button class="primary tutorial-next">${step === 2 ? t('start') : t('next')} <span>↗</span></button></div></section></div>`);
    root.querySelector('.tutorial-skip').addEventListener('click', finish);
    root.querySelector('.tutorial-next').addEventListener('click', () => { if (step < steps.length - 1) { step++; paint(); } else finish(); });
  };
  paint();
}
