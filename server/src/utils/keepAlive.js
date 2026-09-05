/**
 * Render.com Keep-Alive Maintainer Service
 * 
 * Prevents Render Free Tier web services from spinning down due to inactivity (15 min sleep timeout),
 * while intelligently protecting the 750 hours/month free tier allowance and zero software overhead.
 */

function isWithinActiveHours(startHour = 7, endHour = 23, timeZone = 'Asia/Kolkata') {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(now), 10);
    return hour >= startHour && hour < endHour;
  } catch (err) {
    return true; // fallback to active if timezone formatting fails
  }
}

export function initKeepAlive() {
  // Render automatically provides RENDER_EXTERNAL_URL (e.g., https://shree-sai-classes.onrender.com)
  const targetUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.APP_URL ||
    process.env.RENDER_URL;

  if (!targetUrl) {
    console.log('ℹ️  [KeepAlive] No public URL found (local development mode). Keep-alive pinger is idle.');
    return;
  }

  const cleanUrl = targetUrl.replace(/\/+$/, '');
  const healthUrl = `${cleanUrl}/api/health`;

  const intervalMinutes = parseFloat(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '14');
  const intervalMs = Math.max(intervalMinutes * 60 * 1000, 5 * 60 * 1000); // minimum 5 mins

  const allDay = process.env.KEEP_ALIVE_ALL_DAY === 'true';
  const startHour = parseInt(process.env.KEEP_ALIVE_START_HOUR || '7', 10);
  const endHour = parseInt(process.env.KEEP_ALIVE_END_HOUR || '23', 10);
  const timeZone = process.env.KEEP_ALIVE_TIMEZONE || 'Asia/Kolkata';

  console.log(`📡 [KeepAlive] Maintainer configured for: ${healthUrl}`);
  console.log(`⏱️  [KeepAlive] Ping interval: ${intervalMinutes} minutes`);
  console.log(
    allDay
      ? `🕒 [KeepAlive] Schedule: 24/7 continuous`
      : `🕒 [KeepAlive] Active hours: ${startHour}:00 - ${endHour}:00 (${timeZone}) to conserve free tier hours`
  );

  const ping = async () => {
    if (!allDay && !isWithinActiveHours(startHour, endHour, timeZone)) {
      console.log(`🌙 [KeepAlive] Night hours: sleeping to save Render free-tier monthly hours.`);
      return;
    }

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Render-Maintainer-KeepAlive/1.0',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.ok) {
        console.log(`💚 [KeepAlive] Ping successful (${response.status}) at ${new Date().toLocaleTimeString('en-IN', { timeZone })}`);
      } else {
        console.warn(`⚠️ [KeepAlive] Ping received status ${response.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ [KeepAlive] Ping failed: ${err.message}`);
    }
  };

  // Wait 1 minute after server start before the first ping, then recurring
  setTimeout(() => {
    ping();
    setInterval(ping, intervalMs);
  }, 60 * 1000);
}
