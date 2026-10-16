// Paper-only analytics. No credentials belong in this file or its configuration.
(async () => {
  if (!['/', '/index.html'].includes(location.pathname) || location.hostname !== 'tactalent.github.io') return;
  try {
    const configResponse = await fetch('data/analytics.json');
    if (!configResponse.ok) return;
    const config = await configResponse.json();
    if (!config.websiteId) return;

    const language = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
    const pending = [];
    let ready = false;
    const send = (name, data) => Promise.resolve(window.umami.track(props => ({
      ...props, url: '/', title: 'TacTalent',
      ...(name ? {name, data} : {}),
    }))).catch(() => {});
    // Delegate to include both header and footer links; never delay navigation.
    const clicks = event => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.hostname !== 'github.com') return;
      const path = url.pathname.replace(/\/$/, '').toLowerCase();
      const name = path === '/ccyydd/simpletouch' ? 'simpletouch_click'
        : ['/ccyydd/tactalent', '/tactalent/tactalent.github.io'].includes(path) ? 'code_click' : null;
      if (!name) return;
      const data = {language, placement: anchor.closest('footer') ? 'footer' : 'header'};
      if (ready) send(name, data); else pending.push([name, data]);
    };
    document.addEventListener('click', clicks);
    document.addEventListener('auxclick', clicks);
    const script = document.createElement('script');
    script.src = 'https://cloud.umami.is/script.js';
    script.async = true;
    script.dataset.websiteId = config.websiteId;
    script.dataset.domains = 'tactalent.github.io';
    script.dataset.autoTrack = 'false';
    script.dataset.doNotTrack = 'true';
    script.onload = () => {
      if (!window.umami) return;
      ready = true;
      send(); // Exactly one pageview per document load; hash changes are ignored.
      for (const args of pending.splice(0)) send(...args);
    };
    document.head.append(script);

  } catch { /* Analytics must never block the report. */ }
})();
