const rejectPatterns = [
  /^(reject|reject all|decline|refuse|deny|opt out|disagree|no,? thanks)$/i,
  /^(rebutjar|rebutja-ho tot|denegar|denega-ho tot|no acceptar)$/i,
  /^(rechazar|rechazar todas|denegar|denegar todo|no aceptar)$/i,
  /^(refuser|tout refuser|rejeter|tout rejeter)$/i,
  /^(ablehnen|alle ablehnen|verweigern)$/i,
  /^(rifiuta|rifiuta tutto|nega)$/i,
];

const consentContainers = [
  '#onetrust-banner-sdk',
  '#CybotCookiebotDialog',
  '#didomi-host',
  '.qc-cmp2-container',
  '[role="dialog"]',
  '[aria-modal="true"]',
];

const paymentPattern = /(?:pay|payment|subscribe|subscription|premium|€|\$|£|pagar|pagament|suscripci[oó]n|abonament)/i;
const consentPattern = /(?:accept.*cookies|cookies.*accept|reject.*cookies|cookies.*reject|personalised advert|publicitat personalitzada)/i;

function visible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

function isConsentContainer(element: Element): boolean {
  return consentContainers.some((selector) => element.matches(selector) || element.closest(selector) !== null);
}

function rejectVisibleBanner(): boolean {
  const controls = document.querySelectorAll<HTMLElement>('button, [role="button"], input[type="button"], input[type="submit"]');
  for (const control of controls) {
    const label = (control.innerText || control.getAttribute('value') || control.getAttribute('aria-label') || '').trim();
    if (visible(control) && isConsentContainer(control) && rejectPatterns.some((pattern) => pattern.test(label))) {
      control.click();
      void browser.runtime.sendMessage({ type: 'banner-rejected' });
      return true;
    }
  }
  return false;
}

function reportCookieWall(): boolean {
  const containers = document.querySelectorAll<HTMLElement>(consentContainers.join(','));
  for (const container of containers) {
    const text = container.innerText.replace(/\s+/g, ' ').trim();
    if (!visible(container) || !paymentPattern.test(text) || !consentPattern.test(text)) continue;

    const evidence = Array.from(container.querySelectorAll<HTMLElement>('button, [role="button"]'))
      .filter(visible)
      .map((control) => (control.innerText || control.getAttribute('aria-label') || '').trim())
      .filter(Boolean)
      .slice(0, 8);
    void browser.runtime.sendMessage({
      type: 'cookie-wall-detected',
      record: { hostname: window.location.hostname.toLowerCase(), origin: window.location.origin, evidence },
    });
    return true;
  }
  return false;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    const settings = await browser.storage.local.get({ enabled: true, whitelist: [] as string[] }) as { enabled: boolean; whitelist: string[] };
    const hostname = window.location.hostname.toLowerCase();
    if (!settings.enabled || settings.whitelist.some((entry) => hostname === entry || hostname.endsWith(`.${entry}`))) return;

    let handled = false;
    let cookieWallReported = false;
    const tryReject = () => {
      if (!cookieWallReported) cookieWallReported = reportCookieWall();
      if (!handled) handled = rejectVisibleBanner();
    };
    tryReject();
    new MutationObserver(tryReject).observe(document.documentElement, { childList: true, subtree: true });
  },
});
