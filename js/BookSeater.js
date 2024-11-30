class BookSeater {
  constructor() {
    this.thresholds = {};
    this.settings = {
      builders: 6,
      includeSupercharge: false,
      passType: 'goldPass',
      hammers: {
        building: 3,
        fighting: 0
      },
      researchPotsEnabled: true,
      builderHelper: 0,
      labHelper: 1
    }
    this.key = `settings-${this.getAccountIdFromURL()}`;
    this.settingsLoaded = false;
    this.loadSettings();
  }

  reset() {
    this.thresholds = {};
  }

  getAccountIdFromURL() {
    const regex = /\/upgrade-tracker\/([a-zA-Z0-9]+)\/home/;
    const match = window.location.pathname.match(regex);
    return match ? match[1] : null;
  }

  saveSettings() {
    chrome.storage.sync.set({ [this.key]: this.settings });
  }

  loadSettings() {
    chrome.storage.sync.get([this.key], (data) => {
      if (data[this.key]) {
        this.settings = { ...this.settings, ...data[this.key] };
      }
      this.settingsLoaded = true;
    });
  }

  waitForSettings() {
    return new Promise(resolve => {
      const checkSettingsLoaded = () => {
        if (this.settingsLoaded) {
          resolve();
        } else {
          setTimeout(checkSettingsLoaded, 50);
        }
      };
      checkSettingsLoaded();
    });
  }

  createSelect(id, min, max, selectedValue) {
    const select = document.createElement('select');
    select.id = id;
    for (let i = min; i <= max; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      if (i === selectedValue) {
        option.setAttribute('selected', '');
      }
      select.appendChild(option);
    }
    return select;
  }

  async create(page) {
    await this.waitForSettings();
    const ui = document.createElement('div');
    ui.id = "bookseater";
    ui.innerHTML = `
      <h2>Bookseater</h2>
      <label>
        <input id="superchargeToggle" type="checkbox" ${this.settings.includeSupercharge ? 'checked' : ''}> Include Supercharge
      </label>
      <div class="input-row">
        ${this.createSelect('numBuilders', 2, 6, this.settings.builders).outerHTML}
        <label for="numBuilders">Builders</label>
      </div>
      <div id="process" class="button small radius">Process</div>
      <h4>Monthly</h4>
      <label>
        <input id="goldPassToggle" type="checkbox" ${this.settings.passType.includes('gold') ? 'checked' : ''}> Gold Pass
      </label>
      <div class="input-row">
        <input id="hobInput" class="text-center" type="number" min="0" value="${this.settings.hammers.building}">
        <label for="hobInput">Hammer of Building</label>
      </div>
      <div class="input-row">
        <input id="hofInput" class="text-center" type="number" min="0" value="${this.settings.hammers.fighting}">
        <label for="hofInput">Hammer of Fighting</label>
      </div>
      <h4>Weekly</h4>
      <label>
        <input id="researchPotsToggle" type="checkbox" ${this.settings.researchPotsEnabled ? 'checked' : ''}> 3 Research Pots
      </label>
      <h4>Daily</h4>
      <div class="input-row">
        ${this.createSelect('builderHelper', 0, 8, this.settings.builderHelper).outerHTML}
        <label for="builderHelper">Builder's Apprentice</label>
      </div>
      <div class="input-row">
        ${this.createSelect('labHelper', 0, 12, this.settings.labHelper).outerHTML}
        <label for="labHelper">Lab Assistant</label>
      </div>
      <div id="tableContainer"></div>
    `;
    document.body.appendChild(ui);
    // makeDraggable(ui);
    document.getElementById('superchargeToggle').addEventListener('change', ({ target }) => {
      this.settings.includeSupercharge = target.checked;
      this.saveSettings();
      this.reset();
      page.reset();
    });
    document.getElementById('numBuilders').addEventListener('change', ({ target }) => {
      const n = parseInt(target.value, 10);
      if (!isNaN(n)) {
        this.settings.builders = n;
        this.saveSettings();
        this.reset();
        page.reset();
      }
    });
    document.getElementById('goldPassToggle').addEventListener('change', ({ target }) => {
      this.settings.passType = target.checked ? 'goldPass' : 'peasantPass';
      this.saveSettings();
      this.reset();
      page.reset();
    });
    document.getElementById('hobInput').addEventListener('input', ({ target }) => {
      const hammers = parseInt(target.value, 10);
      if (!isNaN(hammers)) {
        this.settings.hammers.building = hammers;
        this.saveSettings();
        this.reset();
        page.reset();
      }
    });
    document.getElementById('hofInput').addEventListener('input', ({ target }) => {
      const hammers = parseInt(target.value, 10);
      if (!isNaN(hammers)) {
        this.settings.hammers.fighting = hammers;
        this.saveSettings();
        this.reset();
        page.reset();
      }
    });
    document.getElementById('researchPotsToggle').addEventListener('change', ({ target }) => {
      this.settings.researchPotsEnabled = target.checked;
      this.saveSettings();
      this.reset();
      page.reset();
    });
    document.getElementById('builderHelper').addEventListener('change', ({ target }) => {
      const level = parseInt(target.value, 10);
      if (!isNaN(level)) {
        this.settings.builderHelper = level;
        this.saveSettings();
        this.reset();
        page.reset();
      }
    });
    document.getElementById('labHelper').addEventListener('change', ({ target }) => {
      const level = parseInt(target.value, 10);
      if (!isNaN(level)) {
        this.settings.labHelper = level;
        this.saveSettings();
        this.reset();
        page.reset();
      }
    });
    document.getElementById('process').addEventListener('click', async () => {
      if (page.processing) return;
      await page.processTabs(this.settings);
      this.update(page);
    });
    this.checkTheme();
    document.getElementById('chkCSSSwitch').addEventListener('change', () => this.checkTheme());
  }

  checkTheme() {
    const ui = document.getElementById('bookseater');
    if (document.getElementById('chkCSSSwitch').checked) {
      ui.classList.add('dark');
    } else {
      ui.classList.remove('dark');
    }
  }

  update(page) {
    const { builder, lab } = this.calculateTimeToMaxAfterSavings(page);
    const calculatedBuilderTime = hoursToTime(builder);
    const calculatedLabTime = hoursToTime(lab);
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = `
    <table class="overview-table" cellspacing="0" rules="rows" border="1">
      <tbody>
        <tr>
          <th>Type</th>
          <th>Total</th>
        </tr>
        <tr>
          <td>Builder Time</td>
          <td>${toTimeString(calculatedBuilderTime)}</td>
        </tr>
        <tr>
          <td>Lab Time</td>
          <td>${toTimeString(calculatedLabTime)}</td>
        </tr>
      </tbody>
    </table>
    <table class="overview-table" cellspacing="0" rules="rows" border="1">
      <tbody>
        <tr>
          <th>Book</th>
          <th>Threshold</th>
        </tr>
        ${Object.entries(this.thresholds).map(([key, value]) => `
          <tr>
            <td>${key.charAt(0).toUpperCase()}${key.slice(1)}</td>
            <td>${value}</td>
          </tr>
        `).join('')
      }
      </tbody>
    </table>
    `;
    tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  calculateTimeToMaxAfterSavings(page) {
    const upgrades = {};
    const upgradesToSkip = {};
    for (const [key, value] of Object.entries(page.upgrades)) {
      upgrades[key] = value.sort((a, b) => b.hours - a.hours);
      upgradesToSkip[key] = 0;
    }
    let builderHours = page.concurrentBuilderHours * this.settings.builders;
    let labHours = page.labHours;
    let simulatedBuilderHours = 0;
    let simulatedLabHours = 0;
    let builderHoursToMax = 0;
    let labHoursToMax = 0;
    // simulating the days semes to work better than subtracting all the time saves
    for (let day = 1; builderHours - simulatedBuilderHours > 0 || labHours - simulatedLabHours > 0; ++day) {
      simulatedBuilderHours += 24 * this.settings.builders + this.settings.builderHelper;
      simulatedLabHours += 24 + this.settings.labHelper;
      if (day % 7 === 0) {
        if (this.settings.researchPotsEnabled) {
          simulatedLabHours += 69;
        }
      }
      if (day % 30 === 0) {
        Object.keys(upgrades).forEach(key => {
          const books = getMagicItemsPerMonth(this.settings, key);
          for (let i = upgradesToSkip[key]; i < upgradesToSkip[key] + books; ++i) {
            const upgrade = upgrades[key][i];
            if (upgrade) {
              const isBuildingOrHeroes = (key === 'building' || key === 'heroes');
              const isFightingOrSpells = (key === 'fighting' || key === 'spells');
              const notMaxed = (isBuildingOrHeroes && builderHoursToMax === 0) || (isFightingOrSpells && labHoursToMax === 0);
              if (notMaxed) {
                if (isBuildingOrHeroes) simulatedBuilderHours += upgrade.hours;
                else if (isFightingOrSpells) simulatedLabHours += upgrade.hours;
                page.highlightedUpgrades.push(upgrade.highlightSelector);
                this.thresholds[key] = toTimeString(hoursToTime(upgrade.hours));
              }
            }
          }
          upgradesToSkip[key] += books;
        });
      }
      if (builderHours - simulatedBuilderHours <= 0 && builderHoursToMax === 0) {
        builderHoursToMax = day * 24 + simulatedBuilderHours - builderHours;
      }
      if (labHours - simulatedLabHours <= 0 && labHoursToMax === 0) {
        labHoursToMax = day * 24 + simulatedLabHours - labHours;
      }
    }
    return {
      builder: builderHoursToMax,
      lab: labHoursToMax
    };
  }
}
