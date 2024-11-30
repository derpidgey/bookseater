class NinjaPage {
  static #tabConfig = {
    defences: { name: 'defences', book: 'building' },
    traps: { name: 'traps', book: 'building' },
    army: { name: 'army', book: 'building' },
    resources: { name: 'resources', book: 'building' },
    troops: { name: 'troops', book: 'fighting' },
    spells: { name: 'spells', book: 'spells' },
    darktroops: { name: 'darktroops', book: 'fighting' },
    siegemachines: { name: 'siegemachines', book: 'fighting' },
    heroes: { name: 'heroes', book: 'heroes' },
    stats: { name: 'stats', book: 'NA' }
  }

  constructor() {
    this.processing = false;
    this.reset();
    for (let { name } of Object.values(NinjaPage.#tabConfig)) {
      document.getElementById(`tablink${name}`).addEventListener('click', async () => {
        await this.tabIsLoaded(name);
        this.highlightedUpgrades.forEach(x => {
          const element = document.querySelector(x);
          if (element) {
            element.parentElement.style.backgroundColor = 'forestgreen';
          }
        });
      });
    }
  }

  reset() {
    this.concurrentBuilderHours = 0;
    this.labHours = 0;
    this.highlightedUpgrades = [];
    this.upgrades = {
      building: [],
      fighting: [],
      spells: [],
      heroes: []
    }
  }

  async processTabs(settings) {
    this.reset();
    this.processing = true;
    for (let { name } of Object.values(NinjaPage.#tabConfig)) {
      document.getElementById(`tablink${name}`).click();
      await this.tabIsLoaded(name);
      this.processTab(name, settings);
    }
    this.processing = false;
  }

  tabIsLoaded(tabName) {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        const element = tabName === NinjaPage.#tabConfig.stats.name ? document.querySelector('#grandTotalHBuilderTime tr:last-child td:nth-child(2)') : document.querySelector(`#${tabName} .overview-table`);
        if (element) {
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
    });
  }

  processTab(tabName, settings) {
    if (tabName === NinjaPage.#tabConfig.stats.name) {
      let builderElement;
      if (settings.includeSupercharge) {
        builderElement = document.querySelector('#pnlSuperchargeTotal #grand-total-table:nth-child(2) tr:last-child td:nth-child(2)');
      } else {
        builderElement = document.querySelector(`#grandTotalHBuilderTime tr:nth-child(${settings.builders}) td:nth-child(2)`);
      }
      if (!builderElement) {
        builderElement = document.querySelector('#grandTotalHBuilderTime tr:last-child td:nth-child(2)');
      }
      this.concurrentBuilderHours = toHours(stringToTime(builderElement.textContent.trim()));
      this.labHours = toHours(stringToTime(document.querySelector('#grandTotalLabTime strong').textContent.trim()));
    } else {
      const bookType = NinjaPage.#tabConfig[tabName].book;
      if (!bookType) return;
      document.querySelectorAll(`#${tabName} .future-upgrade-time`).forEach(x => {
        const tabId = x.closest('.tabs-panel.is-active').id;
        const upgradeId = x.parentElement.children[0].id;
        this.upgrades[bookType].push({
          highlightSelector: `#${tabId} #${upgradeId}`,
          hours: toHours(stringToTime(x.textContent.trim()))
        });
      });
    }
  }
}
