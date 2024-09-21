import { createSignal, type Component, createEffect } from 'solid-js';
import { type PhaseDiagramPoint, type PhaseDiagramLine } from './types';

export type PhaseDiagramGraph = {
    points: PhaseDiagramLine;
    color: string;
};

export type PhaseDiagramCanvasClickEvent = {
    event: MouseEvent;
    click: PhaseDiagramPoint & {
        x: number;
        y: number;
    };
    closestDataPoint:
        | null
        | (PhaseDiagramPoint & {
              x: number;
              y: number;
              pointIndex: number;
              lineIndex: number;
          });
};

export type PhaseDiagramCanvasProps = {
    lines: PhaseDiagramGraph[];
    areas: PhaseDiagramGraph[];
    selectedPoint: PhaseDiagramPoint | null;

    maxTempKelvin: number;
    maxPressureOrder: number;
    width: number;
    height: number;

    onClick: (ev: PhaseDiagramCanvasClickEvent) => void;
};

export const PhaseDiagramCanvas: Component<PhaseDiagramCanvasProps> = (props) => {
    let canvasRef!: HTMLCanvasElement;
    const [hint, setHint] = createSignal('–');

    const redraw = () => {
        const ctx = canvasRef.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, props.width, props.height);

        ctx.lineWidth = 2;
        for (const { points, color } of props.lines) {
            if (!points.length) {
                continue;
            }

            const coords = points.map((pt) => getPointCoords(pt, props));

            ctx.fillStyle = '#000000';
            for (let i = 0; i < coords.length; i++) {
                const { x, y } = coords[i];
                ctx.fillRect(x - 3, y - 3, 7, 7);
            }

            ctx.beginPath();
            ctx.strokeStyle = color;

            ctx.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
                ctx.lineTo(coords[i].x, coords[i].y);
            }

            ctx.stroke();
        }

        if (props.selectedPoint) {
            ctx.fillStyle = '#ff4410';
            const { x, y } = getPointCoords(props.selectedPoint, props);
            ctx.fillRect(x - 2, y - 2, 5, 5);
        }
    };

    const getMouseCoords = (ev: MouseEvent) => {
        const canvasRect = canvasRef.getBoundingClientRect();
        const pos = {
            x: ev.clientX - canvasRect.left,
            y: ev.clientY - canvasRect.top,
        };

        const tK = (pos.x / canvasRect.width) * props.maxTempKelvin;
        const pPa = fromLogPixels(canvasRect.height - pos.y, canvasRect.height, props.maxPressureOrder);
        return { ...pos, t: tK, p: pPa };
    };

    const onMouseMove = (ev: MouseEvent) => {
        const { t: tK, p: pPa } = getMouseCoords(ev);
        const tC = tK - 273.15;
        const pBar = pPa / 1e5;
        setHint(`${tK.toFixed(2)} K / ${tC.toFixed(2)} C / ${pPa.toPrecision(2)} Pa / ${pBar.toPrecision(2)} bar`);
    };

    const onClick = (ev: MouseEvent) => {
        const { x, y, t, p } = getMouseCoords(ev);

        const click: PhaseDiagramCanvasClickEvent = {
            event: ev,
            click: { x, y, T: t, P: p },
            closestDataPoint: null,
        };

        let closestDistance = Infinity;
        for (let li = 0; li < props.lines.length; li++) {
            const line = props.lines[li];
            for (let pi = 0; pi < line.points.length; pi++) {
                const pt = line.points[pi];
                const ptCoords = getPointCoords(pt, props);
                const dx = x - ptCoords.x;
                const dy = y - ptCoords.y;
                const d = dx * dx + dy * dy;
                if (d < closestDistance) {
                    closestDistance = d;
                    click.closestDataPoint = {
                        ...pt,
                        ...ptCoords,
                        lineIndex: li,
                        pointIndex: pi,
                    };
                }
            }
        }

        props.onClick(click);
    };

    const prevent = (ev: MouseEvent) => {
        ev.preventDefault();
        return false;
    };

    createEffect(() => {
        redraw();
    });

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={props.width}
                height={props.height}
                onMouseMove={onMouseMove}
                onMouseDown={onClick}
                onContextMenu={prevent}
            />
            <div>{hint()}</div>
        </div>
    );
};

function getPointCoords(
    { T, P }: PhaseDiagramPoint,
    {
        width,
        height,
        maxPressureOrder,
        maxTempKelvin,
    }: Pick<PhaseDiagramCanvasProps, 'width' | 'height' | 'maxTempKelvin' | 'maxPressureOrder'>,
) {
    return {
        x: (T / maxTempKelvin) * width,
        y: height - toLogPixels(P, maxPressureOrder, height),
    };
}

function toLogPixels(abs: number, maxOrder: number, maxPx: number): number {
    if (abs <= 1) {
        return 0;
    }

    return (Math.log10(abs) / maxOrder) * maxPx;
}

function fromLogPixels(px: number, maxPx: number, maxOrder: number): number {
    return Math.pow(10, (px / maxPx) * maxOrder);
}
