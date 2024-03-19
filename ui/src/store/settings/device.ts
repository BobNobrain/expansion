import { createStore } from 'solid-js/store';
import { type SettingsStore } from './types';

export enum GraphicsQuality {
    Low,
    Medium,
    High,
}

export type PerDeviceSettings = {
    graphicsQuality: GraphicsQuality;
};

const LOCAL_STORAGE_KEY = 'expansion_device_settings';

const [deviceSettings, setDeviceSettings] = createStore<PerDeviceSettings>(getDefaultSettings());

let isLoaded = false;

export const useDeviceSettings = (): SettingsStore<PerDeviceSettings> => {
    if (!isLoaded) {
        loadFromLocalStorage();
        isLoaded = true;
    }

    return {
        settings: deviceSettings,
        update: (name, value) => {
            setDeviceSettings(name, value);
            syncToLocalStorage();
        },
    };
};

function syncToLocalStorage() {
    const json = JSON.stringify(deviceSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
}

function loadFromLocalStorage() {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!json) {
        return;
    }

    setDeviceSettings(JSON.parse(json) as PerDeviceSettings);
}

function getDefaultSettings(): PerDeviceSettings {
    // good enough for now
    const nCpus = navigator.hardwareConcurrency;
    const isTouch = navigator.maxTouchPoints > 1;

    let quality = GraphicsQuality.Low;
    if (nCpus > 8) {
        quality = GraphicsQuality.Medium;
    }
    if (nCpus > 8 && !isTouch) {
        quality = GraphicsQuality.High;
    }

    return {
        graphicsQuality: quality,
    };
}
