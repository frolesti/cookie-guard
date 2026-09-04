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

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    const settings = await browser.storage.local.get({ enabled: true, whitelist: [] as string[] }) as { enabled: boolean; whitelist: string[] };
    const hostname = window.location.hostname.toLowerCase();
    if (!settings.enabled || settings.whitelist.some((entry) => hostname === entry || hostname.endsWith(`.${entry}`))) return;

    let handled = false;
    const tryReject = () => {
      if (!handled) handled = rejectVisibleBanner();
    };
    tryReject();
    new MutationObserver(tryReject).observe(document.documentElement, { childList: true, subtree: true });
  },
});
