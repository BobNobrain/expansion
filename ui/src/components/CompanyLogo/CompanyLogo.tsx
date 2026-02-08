import { createMemo, For, Show, type Component, type JSX } from 'solid-js';
import type { CompanyLogoElement, CompanyLogo as Logo } from '@/domain/Company';
import styles from './CompanyLogo.module.css';

export type CompanyLogoProps = {
    value: Logo | null;
    isLoading?: boolean;
    companyName: string | null;
    height?: string;
    showRulers?: boolean;
    hilightIndex?: number;
};

const LogoElement: Component<{ element: CompanyLogoElement }> = (props) => {
    const content = createMemo((): JSX.Element => {
        const el = props.element;

        switch (el.type) {
            case 'ellipse':
                return <ellipse fill={el.c} cx={el.x} cy={el.y} rx={el.rx} ry={el.ry} />;

            case 'rect':
                return <rect fill={el.c} x={el.x - el.rx} y={el.y - el.ry} width={el.rx * 2} height={el.ry * 2} />;

            case 'text':
                return (
                    <text
                        x={el.x}
                        y={el.y}
                        textLength={180}
                        lengthAdjust="spacingAndGlyphs"
                        text-anchor="middle"
                        dominant-baseline="central"
                        font-size={Math.min(100, 250 / el.text.trim().length).toFixed(1)}
                        fill={el.c}
                    >
                        {el.text}
                    </text>
                );
        }
    });

    return content();
};

export const CompanyLogo: Component<CompanyLogoProps> = (props) => {
    return (
        <div class={styles.wrapper} style={{ height: props.height }}>
            <svg class={styles.logo} viewBox="-100 -100 200 200">
                <Show
                    when={!props.isLoading && props.value}
                    fallback={
                        <text x={0} y={0} text-anchor="middle" fill="currentColor">
                            {props.companyName}
                        </text>
                    }
                >
                    <For each={props.value!.elements}>{(el) => <LogoElement element={el} />}</For>
                </Show>

                <Show when={props.showRulers}>
                    <rect x={-100} y={-100} width={200} height={200} class={styles.borderRuler} />
                    <path d="M0,-100L0,100M-100,0L100,0" class={styles.axisRulers} />
                </Show>
            </svg>
        </div>
    );
};
