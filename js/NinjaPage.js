class NinjaPage {
  static #tabConfig = {
    defences: { name: 'defences', book: 'building', tabLoadedSelector: '#defences .overview-table' },
    traps: { name: 'traps', book: 'building', tabLoadedSelector: '#traps .overview-table' },
    army: { name: 'army', book: 'building', tabLoadedSelector: '#army .overview-table' },
    resources: { name: 'resources', book: 'building', tabLoadedSelector: '#resources .overview-table' },
    troops: { name: 'troops', book: 'fighting', tabLoadedSelector: '#troops .overview-table' },
    spells: { name: 'spells', book: 'spells', tabLoadedSelector: '#spells .overview-table' },
    darktroops: { name: 'darktroops', book: 'fighting', tabLoadedSelector: '#darktroops .overview-table' },
    siegemachines: { name: 'siegemachines', book: 'fighting', tabLoadedSelector: '#siegemachines .overview-table' },
    heroes: { name: 'heroes', book: 'heroes', tabLoadedSelector: '#heroes .overview-table' },
    stats: { name: 'stats', book: 'NA', tabLoadedSelector: '#grandTotalHBuilderTime tr:last-child td:nth-child(2)' }
  }

  constructor() {
    this.processing = false;
    this.reset();
    for (let { name } of Object.values(NinjaPage.#tabConfig)) {
      document.getElementById(`tablink${name}`)?.addEventListener('click', async () => {
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
      const tabLink = document.getElementById(`tablink${name}`);
      if (!tabLink) continue;
      tabLink.click();
      await this.tabIsLoaded(name);
      this.processTab(name, settings);
    }
    this.processing = false;
  }

  tabIsLoaded(tabName) {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        if (document.querySelector(NinjaPage.#tabConfig[tabName].tabLoadedSelector)) {
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
        builderElement = document.querySelector('#pnlSuperchargeTotal #grand-total-table tbody tr:last-child td:nth-child(2)');
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
      document.querySelectorAll(`#${tabName} .future-upgrade-time`).forEach(futureUpgradeTime => {
        const upgradeId = futureUpgradeTime.parentElement.children[0].id;
        this.upgrades[bookType].push({
          highlightSelector: `#${tabName} #${upgradeId}`,
          hours: toHours(stringToTime(futureUpgradeTime.textContent.trim()))
        });
      });
    }
  }
}
