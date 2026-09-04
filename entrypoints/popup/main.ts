import './style.css';

type Settings = { enabled: boolean; whitelist: string[]; removedCookies: number; rejectedBanners: number };
const defaults: Settings = { enabled: true, whitelist: [], removedCookies: 0, rejectedBanners: 0 };

async function currentHost(): Promise<string | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try { return new URL(tab.url).hostname.toLowerCase(); } catch { return null; }
}

async function render(): Promise<void> {
  const settings = { ...defaults, ...await browser.storage.local.get(defaults) };
  const host = await currentHost();
  const isProtected = Boolean(host && settings.whitelist.some((entry) => host === entry || host.endsWith(`.${entry}`)));
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <main>
      <header><strong>Cookie Guard</strong><span>${settings.enabled ? 'Actiu' : 'Aturat'}</span></header>
      <label class="switch"><input id="enabled" type="checkbox" ${settings.enabled ? 'checked' : ''}><span>Protecció activa</span></label>
      <section><p>${host ?? 'Pàgina no compatible'}</p><button id="site" type="button" ${host ? '' : 'disabled'}>${isProtected ? 'Treu de les excepcions' : 'Permet aquest lloc'}</button></section>
      <dl><div><dt>Cookies eliminades</dt><dd>${settings.removedCookies}</dd></div><div><dt>Banners rebutjats</dt><dd>${settings.rejectedBanners}</dd></div></dl>
      <button id="clean" type="button" class="danger">Elimina ara</button>
    </main>`;
  document.querySelector<HTMLInputElement>('#enabled')!.addEventListener('change', async (event) => {
    await browser.storage.local.set({ enabled: (event.target as HTMLInputElement).checked });
    await render();
  });
  document.querySelector<HTMLButtonElement>('#site')!.addEventListener('click', async () => {
    if (!host) return;
    const whitelist = isProtected ? settings.whitelist.filter((entry) => entry !== host) : [...settings.whitelist, host];
    await browser.storage.local.set({ whitelist });
    await render();
  });
  document.querySelector<HTMLButtonElement>('#clean')!.addEventListener('click', async () => {
    await browser.runtime.sendMessage({ type: 'clean-now' });
    await render();
  });
}

void render();
