export type SettingsStore<S> = {
    settings: S;
    update: <Name extends keyof S>(setting: Name, value: S[Name]) => void;
};
