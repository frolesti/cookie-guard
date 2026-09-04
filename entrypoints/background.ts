const CLEANUP_ALARM = 'cookie-guard-cleanup';

type Settings = {
  enabled: boolean;
  whitelist: string[];
  cleanupIntervalMinutes: number;
  removedCookies: number;
  rejectedBanners: number;
};

const defaults: Settings = {
  enabled: true,
  whitelist: [],
  cleanupIntervalMinutes: 30,
  removedCookies: 0,
  rejectedBanners: 0,
};

function hostnameFromCookie(cookie: Browser.cookies.Cookie): string {
  return cookie.domain.replace(/^\./, '').toLowerCase();
}

function isWhitelisted(hostname: string, whitelist: string[]): boolean {
  return whitelist.some((entry) => hostname === entry || hostname.endsWith(`.${entry}`));
}

async function getSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get(defaults);
  return { ...defaults, ...stored };
}

async function removeCookie(cookie: Browser.cookies.Cookie): Promise<boolean> {
  const scheme = cookie.secure ? 'https' : 'http';
  const url = `${scheme}://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
  if (cookie.partitionKey) {
    return Boolean(await browser.cookies.remove({
      url,
      name: cookie.name,
      storeId: cookie.storeId,
      partitionKey: cookie.partitionKey,
    }));
  }

  return Boolean(await browser.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId }));
}

async function cleanCookies(): Promise<number> {
  const settings = await getSettings();
  if (!settings.enabled) return 0;

  const cookies = await browser.cookies.getAll({});
  let removed = 0;
  for (const cookie of cookies) {
    if (!isWhitelisted(hostnameFromCookie(cookie), settings.whitelist) && await removeCookie(cookie)) {
      removed += 1;
    }
  }

  if (removed > 0) {
    await browser.storage.local.set({ removedCookies: settings.removedCookies + removed });
  }
  return removed;
}

async function scheduleCleanup(): Promise<void> {
  const { cleanupIntervalMinutes } = await getSettings();
  await browser.alarms.create(CLEANUP_ALARM, { periodInMinutes: cleanupIntervalMinutes });
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') await browser.storage.local.set(defaults);
    await scheduleCleanup();
    await cleanCookies();
  });

  browser.runtime.onStartup.addListener(async () => {
    await scheduleCleanup();
    await cleanCookies();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CLEANUP_ALARM) void cleanCookies();
  });

  browser.runtime.onMessage.addListener(async (message) => {
    if (message?.type === 'clean-now') return cleanCookies();
    if (message?.type === 'banner-rejected') {
      const settings = await getSettings();
      await browser.storage.local.set({ rejectedBanners: settings.rejectedBanners + 1 });
    }
  });
});
