import { createSignal, type Component, createEffect } from 'solid-js';
import { type PhaseDiagramLine } from './types';

export type PhaseDiagramGraph = {
    points: PhaseDiagramLine;
    color: string;
};

export type PhaseDiagramCanvasProps = {
    lines: PhaseDiagramGraph[];
    maxTempKelvin: number;
    maxPressureOrder: number;
    width: number;
    height: number;
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

            const coords = points.map(({ T, P }) => ({
                x: (T / props.maxTempKelvin) * props.width,
                y: props.height - toLogPixels(P, props.maxPressureOrder, props.height),
            }));

            ctx.beginPath();
            ctx.strokeStyle = color;

            ctx.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
                ctx.lineTo(coords[i].x, coords[i].y);
            }

            ctx.stroke();
        }
    };

    const onMouseMove = (ev: MouseEvent) => {
        const canvasRect = canvasRef.getBoundingClientRect();
        const pos = {
            x: ev.clientX - canvasRect.left,
            y: ev.clientY - canvasRect.top,
        };

        const tK = (pos.x / canvasRect.width) * props.maxTempKelvin;
        const tC = tK - 273.15;
        const pPa = fromLogPixels(canvasRect.height - pos.y, canvasRect.height, props.maxPressureOrder);
        const pBar = pPa / 1e5;
        setHint(`${tK.toFixed(2)} K / ${tC.toFixed(2)} C / ${pPa.toPrecision(2)} Pa / ${pBar.toPrecision(2)} bar`);
    };

    createEffect(() => {
        redraw();
    });

    return (
        <div>
            <canvas ref={canvasRef} width={props.width} height={props.height} onMouseMove={onMouseMove} />
            <div>{hint()}</div>
        </div>
    );
};

function toLogPixels(abs: number, maxOrder: number, maxPx: number): number {
    if (abs <= 1) {
        return 0;
    }

    return (Math.log10(abs) / maxOrder) * maxPx;
}

function fromLogPixels(px: number, maxPx: number, maxOrder: number): number {
    return Math.pow(10, (px / maxPx) * maxOrder);
}
