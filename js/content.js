const magicItemConfig = {
  goldPass: {
    building: 1,
    fighting: 1,
    spells: 1,
    heroes: 2
  },
  peasantPass: {
    building: 0,
    fighting: 0,
    spells: 0,
    heroes: 1
  }
}

function getMagicItemsPerMonth(settings, bookType) {
  let value = 0;
  if (bookType === 'building') value += settings.hammers.building;
  if (bookType === 'fighting') value += settings.hammers.fighting;
  value += magicItemConfig[settings.passType][bookType];
  return value;
}

const page = new NinjaPage();
const bookSeater = new BookSeater();
bookSeater.create(page);
