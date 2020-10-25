// return a setting
export function getSetting(setting: string, address: string) {
  if (getSettingsObj(address)[setting] === null)
    saveSetting(setting, null, address);
  return getSettingsObj(address)[setting];
}

// save a setting
export function saveSetting(setting: string, value: any, address: string) {
  let currentSettings = getSettingsObj(address);

  currentSettings[setting] = value;

  const cache = JSON.parse(localStorage.getItem("settings") || "{}");
  cache[address] = currentSettings;
  localStorage.setItem("settings", JSON.stringify(cache));
}

// get the actual settings string and parse
function getSettingsObj(address: string) {
  let currentSettings = JSON.parse(localStorage.getItem("settings") || "{}");

  if (!currentSettings[address]) currentSettings[address] = {};

  return currentSettings[address];
}
