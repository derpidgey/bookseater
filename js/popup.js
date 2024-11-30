document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('link-toggle');

  chrome.storage.local.get('defaultToHome', data => {
    toggle.checked = !!data.defaultToHome;
  });

  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ defaultToHome: toggle.checked });
  });
});
