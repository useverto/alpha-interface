// return a setting
export function getSetting(setting: string, address: string) {
  return getSettingsObj(address)[setting];
}

// save a setting
export function saveSetting(setting: string, value: any, address: string) {
  let currentSettings = getSettingsObj(address);

  currentSettings[address][setting] = value;

  localStorage.setItem("settings", JSON.stringify(currentSettings));
}

// get the actual settings string and parse
function getSettingsObj(address: string) {
  let currentSettings = JSON.parse(localStorage.getItem("settings") || "{}");

  if (!currentSettings[address]) currentSettings[address] = {};

  return currentSettings;
}
