chrome.storage.local.get('defaultToHome', data => {
  if (data.defaultToHome) {
    document.querySelectorAll('.village-name a').forEach(link => {
      if (!link.href.endsWith('/home')) {
        link.href += '/home';
      }
    });
  }
});
