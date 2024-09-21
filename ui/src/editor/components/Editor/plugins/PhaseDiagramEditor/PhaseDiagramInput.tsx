import { type Component, createMemo, createSignal } from 'solid-js';
import { NumberInput } from '../../../../../components/NumberInput/NumberInput';
import { MouseButton } from '../../../../../lib/mouse';
import { PhaseDiagramCanvas, type PhaseDiagramCanvasClickEvent, type PhaseDiagramGraph } from './PhaseDiagramCanvas';
import {
    getPoint,
    type PhaseDiagramLineName,
    type PhaseDiagramInternalState,
    type PhaseDiagramPointRef,
} from './state';
import { type PhaseDiagramLine, type PhaseDiagramPoint } from './types';
import styles from './PhaseDiagram.module.css';

export type PhaseDiagramInputProps = {
    state: PhaseDiagramInternalState;
    onPointUpdate: (ref: PhaseDiagramPointRef, newValue: PhaseDiagramPoint | null) => void;
};

const colors: Record<PhaseDiagramLineName, string> = {
    melt: '#2266ff',
    boil: '#aa5511',
    subl: '#559922',
};

export const PhaseDiagramInput: Component<PhaseDiagramInputProps> = (props) => {
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

    return (
        <div>
            <div>{props.state.type}</div>
            <div class={styles.inputLine}>
                <NumberInput value={maxTempK()} onUpdate={setMaxTempK} min={10} max={5000} />
                <NumberInput value={maxPressureOrder()} onUpdate={setMaxPressureOrder} min={2} max={12} />
            </div>
            <div class={styles.inputLine}>
                <NumberInput
                    value={selectedPointValue()?.T ?? 0}
                    onUpdate={updateSelectedPointTemp}
                    min={0}
                    max={5000}
                />
                <NumberInput
                    value={selectedPointValue()?.P ?? 1}
                    onUpdate={updateSelectedPointPressure}
                    min={1}
                    max={1e12}
                />
            </div>
            <PhaseDiagramCanvas
                lines={lines()}
                areas={[]}
                width={600}
                height={450}
                maxTempKelvin={maxTempK()}
                maxPressureOrder={maxPressureOrder()}
                selectedPoint={selectedPointValue()}
                onClick={onClick}
            />
        </div>
    );
};
