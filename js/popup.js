document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('link-toggle');

  chrome.storage.sync.get('defaultToHome', data => {
    toggle.checked = !!data.defaultToHome;
  });

  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ defaultToHome: toggle.checked });
  });
});
