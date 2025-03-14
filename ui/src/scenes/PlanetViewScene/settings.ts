import { createSignal } from 'solid-js';

export type RenderMode = 'natural' | 'biomes' | 'soil' | 'moisture' | 'elevations';

export type PlanetViewSceneSettingsState = {
    getMode: () => RenderMode;
    setMode: (mode: RenderMode) => void;

    hasNaturalLighting: () => boolean;
    toggleNaturalLighting: () => void;

    showBorders: () => boolean;
    toggleShowBorders: () => void;
};

export function createPlanetViewSceneSettings(): PlanetViewSceneSettingsState {
    const [getMode, setMode] = createSignal<RenderMode>('natural');
    const [hasNaturalLighting, setHasNaturalLighting] = createSignal(true);
    const [showBorders, setShowBorders] = createSignal(false);

    return {
        getMode,
        setMode: (mode) => {
            setMode(mode);
            setHasNaturalLighting((natural) => {
                if (natural && mode !== 'natural') {
                    return false;
                }

                return natural;
            });
        },
        hasNaturalLighting,
        toggleNaturalLighting: () => {
            setHasNaturalLighting((wasNatural) => {
                const isNaturalNow = !wasNatural;
                setMode((mode) => {
                    if (mode !== 'natural' && isNaturalNow) {
                        return 'natural';
                    }

                    return mode;
                });
                setShowBorders((wasShowing) => {
                    if (wasShowing && isNaturalNow) {
                        return false;
                    }

                    return wasShowing;
                });

                return isNaturalNow;
            });
        },
        showBorders,
        toggleShowBorders: () => setShowBorders((prev) => !prev),
    };
}
