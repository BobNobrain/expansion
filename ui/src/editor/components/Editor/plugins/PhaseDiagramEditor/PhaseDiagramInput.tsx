import { type Component, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { NumberInputOld } from '@/atoms/NumberInputOld/NumberInput';
import { registerInFormContext, createValidationState } from '@/atoms/Form';
import { KeyCodes } from '@/lib/keyboard';
import { MouseButton } from '@/lib/mouse';
import { PhaseDiagramCanvas, type PhaseDiagramCanvasClickEvent, type PhaseDiagramGraph } from './PhaseDiagramCanvas';
import {
    getPoint,
    type PhaseDiagramLineName,
    type PhaseDiagramInternalState,
    type PhaseDiagramPointRef,
} from './state';
import {
    type HePhaseDiagram,
    type MeltPhaseDiagram,
    type PhaseDiagramData,
    type TriplePhaseDiagram,
    type PhaseDiagramLine,
    type PhaseDiagramPoint,
} from './types';
import styles from './PhaseDiagram.module.css';

export type PhaseDiagramInputProps = {
    state: PhaseDiagramInternalState;
    formKey: string;
    onPointUpdate: (ref: PhaseDiagramPointRef, newValue: PhaseDiagramPoint | null) => void;
};

const colors: Record<PhaseDiagramLineName, string> = {
    melt: '#2266ff',
    boil: '#aa5511',
    subl: '#559922',
};

export const PhaseDiagramInput: Component<PhaseDiagramInputProps> = (props) => {
    const validity = createValidationState();

    const lines = createMemo<PhaseDiagramGraph[]>(() => {
        const lines: PhaseDiagramGraph[] = [];
        for (const name of Object.keys(colors) as (keyof typeof colors)[]) {
            let points = props.state[name];
            if (props.state.triple && props.state.type === 'triple') {
                points = points.slice();
                switch (name) {
                    case 'subl':
                        points.push(props.state.triple);
                        break;

                    case 'boil':
                    case 'melt':
                        points.unshift(props.state.triple);
                        break;
                }
            }
            lines.push({ points, color: colors[name] });
        }
        return lines;
    });

    let initialMaxTemp = 500;
    let initialMaxPressure = 1e8;
    const points: PhaseDiagramLine = [...props.state.boil, ...props.state.melt, ...props.state.subl];
    for (const pt of points) {
        initialMaxTemp = Math.max(pt.T, initialMaxTemp);
        initialMaxPressure = Math.max(pt.P, initialMaxPressure);
    }

    const [maxTempK, setMaxTempK] = createSignal(initialMaxTemp);
    const [maxPressureOrder, setMaxPressureOrder] = createSignal(Math.ceil(Math.log10(initialMaxPressure)));

    const [selectedPoint, setSelectedPoint] = createSignal<null | PhaseDiagramPointRef>(null);

    const selectedPointValue = createMemo(() => {
        const ref = selectedPoint();
        if (!ref) {
            return null;
        }
        return getPoint(props.state, ref);
    });

    const updateSelectedPointTemp = (t: number) => {
        const ref = selectedPoint();
        if (!ref) {
            return;
        }
        props.onPointUpdate(ref, { ...selectedPointValue()!, T: t });
    };
    const updateSelectedPointPressure = (p: number) => {
        const ref = selectedPoint();
        if (!ref) {
            return;
        }
        props.onPointUpdate(ref, { ...selectedPointValue()!, P: p });
    };

    const onClick = (click: PhaseDiagramCanvasClickEvent) => {
        let closestPointRef: PhaseDiagramPointRef | null = null;
        if (click.closestDataPoint) {
            const lineName = (Object.keys(colors) as (keyof typeof colors)[])[click.closestDataPoint.lineIndex];
            closestPointRef = {
                line: lineName,
                index: click.closestDataPoint.pointIndex,
            };
            if (props.state.type === 'triple') {
                switch (lineName) {
                    case 'subl':
                        if (click.closestDataPoint.pointIndex === props.state.subl.length) {
                            closestPointRef = 'triple';
                        }
                        break;

                    case 'boil':
                    case 'melt':
                        if (click.closestDataPoint.pointIndex === 0) {
                            closestPointRef = 'triple';
                        } else {
                            closestPointRef.index--;
                        }
                }
            }
        }

        if (click.event.button === MouseButton.Left) {
            if (!click.closestDataPoint) {
                setSelectedPoint(null);
                return;
            }

            const dx = click.click.x - click.closestDataPoint.x;
            const dy = click.click.y - click.closestDataPoint.y;
            const d = dx * dx + dy * dy;

            if (d > 250) {
                setSelectedPoint(null);
                return;
            }

            setSelectedPoint(closestPointRef);
            return;
        }

        if (click.event.button === MouseButton.Right) {
            const selected = selectedPoint();
            console.log(selected);
            if (!selected) {
                return;
            }

            click.event.preventDefault();
            props.onPointUpdate(selected, click.click);
            return;
        }

        console.log(click.event.button);
    };

    registerInFormContext(props, {
        retrieveValue: (): PhaseDiagramData => {
            const { state } = props;
            switch (state.type) {
                case 'triple': {
                    const value: TriplePhaseDiagram = {
                        type: state.type,
                        triple: state.triple || { T: 0, P: 0 },
                        boil: state.boil,
                        melt: state.melt,
                        subl: state.subl,
                    };
                    return value;
                }

                case 'he': {
                    const value: HePhaseDiagram = {
                        type: state.type,
                        boil: state.boil,
                        melt: state.melt,
                    };
                    return value;
                }

                case 'melt': {
                    const value: MeltPhaseDiagram = {
                        type: state.type,
                        melt: state.melt,
                    };
                    return value;
                }
            }
        },
        validate: () => {
            const linesToCheck = [props.state.melt];
            switch (props.state.type) {
                case 'triple':
                    if (!props.state.triple) {
                        validity.setError('triple diagram type requires a triple point');
                        return false;
                    }
                    linesToCheck.push(props.state.boil);
                    linesToCheck.push(props.state.subl);
                    break;

                case 'he':
                    linesToCheck.push(props.state.boil);
                    break;
            }

            for (const line of linesToCheck) {
                if (!line.length) {
                    validity.setError('all lines must have at least 1 point');
                    return false;
                }
            }

            return true;
        },
    });

    const onKeyUp = (ev: KeyboardEvent) => {
        const selection = selectedPoint();
        if (!selection || selection === 'triple') {
            return;
        }
        switch (ev.key) {
            case KeyCodes.Delete:
            case KeyCodes.Backspace:
                props.onPointUpdate(selection, null);
                setSelectedPoint(null);
                break;

            default:
                return;
        }
    };

    onMount(() => {
        document.addEventListener('keyup', onKeyUp);
    });
    onCleanup(() => {
        document.removeEventListener('keyup', onKeyUp);
    });

    return (
        <div>
            <div>{props.state.type}</div>
            <div class={styles.inputLine}>
                <NumberInputOld value={maxTempK()} onUpdate={setMaxTempK} min={10} max={5000} />
                <NumberInputOld value={maxPressureOrder()} onUpdate={setMaxPressureOrder} min={2} max={12} />
            </div>
            <div class={styles.inputLine}>
                <NumberInputOld
                    value={selectedPointValue()?.T ?? 0}
                    onUpdate={updateSelectedPointTemp}
                    min={0}
                    max={5000}
                />
                <NumberInputOld
                    value={selectedPointValue()?.P ?? 1}
                    onUpdate={updateSelectedPointPressure}
                    min={1}
                    max={1e12}
                />
            </div>
            <PhaseDiagramCanvas
                lines={lines()}
                areas={[]}
                width={800}
                height={600}
                maxTempKelvin={maxTempK()}
                maxPressureOrder={maxPressureOrder()}
                selectedPoint={selectedPointValue()}
                onClick={onClick}
            />
        </div>
    );
};
