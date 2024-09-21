import { createStore } from 'solid-js/store';
import { type PhaseDiagramData, type PhaseDiagramLine, type PhaseDiagramPoint } from './types';

export type PhaseDiagramLineName = 'subl' | 'melt' | 'boil';

export type PhaseDiagramPointRef =
    | {
          line: PhaseDiagramLineName;
          index: number;
      }
    | 'triple';

export type PhaseDiagramInternalState = {
    type: PhaseDiagramData['type'];
    subl: PhaseDiagramLine;
    melt: PhaseDiagramLine;
    boil: PhaseDiagramLine;
    triple: PhaseDiagramPoint | null;
};

export function getPoint(state: PhaseDiagramInternalState, ref: PhaseDiagramPointRef): PhaseDiagramPoint | null {
    if (ref === 'triple') {
        return state.triple;
    }

    return state[ref.line][ref.index] ?? null;
}

export function usePhaseDiagramState(initial: PhaseDiagramData | null): {
    state: PhaseDiagramInternalState;
    updatePoint: (ref: PhaseDiagramPointRef, value: PhaseDiagramPoint | null) => void;
    updateType: (newType: PhaseDiagramData['type']) => void;
} {
    const [state, update] = createStore<PhaseDiagramInternalState>({
        type: initial?.type ?? 'triple',
        triple: initial ? ('triple' in initial ? initial.triple : null) : { P: 1e5, T: 300 },
        subl: initial && 'subl' in initial ? initial.subl : [],
        melt: initial && 'melt' in initial ? initial.melt : [],
        boil: initial && 'boil' in initial ? initial.boil : [],
    });

    return {
        state,
        updatePoint: (ref, value) => {
            if (ref === 'triple') {
                if (value) {
                    update('triple', value);
                }
                return;
            }

            if (value) {
                update(ref.line, ref.index, value);
                return;
            }

            update(ref.line, (line) => line.filter((_, i) => i !== ref.index));
        },
        updateType: (newType) => update('type', newType),
    };
}
