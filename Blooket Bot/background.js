async function disableCSPForAllTabs() {
  const tabs = await chrome.tabs.query({});
  const tabIds = tabs.map((tab) => tab.id);

  chrome.storage.local.set({ disabledTabIds: tabIds });

  chrome.declarativeNetRequest.updateSessionRules({
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [{
          header: 'content-security-policy',
          operation: 'remove',
        }],
      },
      condition: {
        resourceTypes: ["main_frame", "sub_frame"],
      },
    }],
    removeRuleIds: [1],
  });
}

function init() {

  chrome.storage.local.set({ disabledTabIds: [] });

  disableCSPForAllTabs();

  chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get('disabledTabIds').then((data) => {
      const updatedTabIds = [...data.disabledTabIds, tab.id];
      chrome.storage.local.set({ disabledTabIds: updatedTabIds });
    });

    disableCSPForAllTabs();
  });

  chrome.tabs.onUpdated.addListener((tabId) => {
    disableCSPForAllTabs();
  });

  chrome.runtime.setUninstallURL('https://discord.gg/blooket');
}

init();