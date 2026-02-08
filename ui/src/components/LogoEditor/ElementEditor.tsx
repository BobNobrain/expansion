import { Show, type Component } from 'solid-js';
import { Button, Container, HBarRow, HBarSlider, TextInput } from '@/atoms';
import type { CompanyLogoElement } from '@/domain/Company';
import styles from './LogoEditor.module.css';

const Slider: Component<{
    min: number;
    max: number;
    value: number;
    label: string;
    onUpdate: (value: number) => void;
}> = (props) => {
    return (
        <div class={styles.slider}>
            <div class={styles.sliderLabels}>
                <span class={styles.sliderLabel}>{props.min.toFixed()}</span>
                <span class={styles.sliderLabel}>
                    {props.label}: {props.value.toFixed()}
                </span>
                <span class={styles.sliderLabel}>{props.max.toFixed()}</span>
            </div>
            <HBarRow>
                <HBarSlider
                    share={1}
                    value={props.value}
                    valueStep={10}
                    onUpdate={props.onUpdate}
                    valueRange={{ from: props.min, to: props.max }}
                />
            </HBarRow>
        </div>
    );
};

export const ElementEditor: Component<{
    selectedElement: CompanyLogoElement | null;
    onUpdate: (patch: Partial<CompanyLogoElement>) => void;
}> = (props) => {
    const switchType = (to: CompanyLogoElement['type']) => {
        const el = props.selectedElement;
        if (!el) {
            return;
        }

        const currentType = el.type;
        if (to === currentType) {
            return;
        }

        if ((currentType === 'rect' && to === 'ellipse') || (currentType === 'ellipse' && to === 'rect')) {
            props.onUpdate({ type: to });
            return;
        }

        if (to === 'text') {
            props.onUpdate({ type: 'text', text: 'Text' });
            return;
        }

        props.onUpdate({ type: to, rx: 50, ry: 50 });
    };

    return (
        <Container hasGap>
            <div class={styles.elementTypeSelector}>
                <Button
                    style="light"
                    color={props.selectedElement?.type === 'rect' ? 'primary' : undefined}
                    onClick={() => switchType('rect')}
                >
                    Rectangle
                </Button>
                <Button
                    style="light"
                    color={props.selectedElement?.type === 'ellipse' ? 'primary' : undefined}
                    onClick={() => switchType('ellipse')}
                >
                    Ellipse
                </Button>
                <Button
                    style="light"
                    color={props.selectedElement?.type === 'text' ? 'primary' : undefined}
                    onClick={() => switchType('text')}
                >
                    Label
                </Button>
            </div>
            <Container padded background="light" hasGap>
                <Show when={props.selectedElement?.type === 'text'}>
                    <TextInput
                        label="Text"
                        value={props.selectedElement?.type === 'text' ? props.selectedElement.text : ''}
                        onUpdate={(value) => props.onUpdate({ text: value })}
                        clearable
                    />
                </Show>
                <Slider
                    label="x"
                    value={props.selectedElement?.x ?? 0}
                    onUpdate={(value) => props.onUpdate({ x: value })}
                    min={-100}
                    max={100}
                />
                <Slider
                    label="y"
                    value={props.selectedElement?.y ?? 0}
                    onUpdate={(value) => props.onUpdate({ y: value })}
                    min={-100}
                    max={100}
                />
                <Show when={['ellipse', 'rect'].includes(props.selectedElement?.type as string)}>
                    <Slider
                        label="w"
                        value={
                            (props.selectedElement as Extract<CompanyLogoElement, { type: 'ellipse' | 'rect' }> | null)
                                ?.rx ?? 0
                        }
                        onUpdate={(value) => props.onUpdate({ rx: value })}
                        min={10}
                        max={100}
                    />
                    <Slider
                        label="h"
                        value={
                            (props.selectedElement as Extract<CompanyLogoElement, { type: 'ellipse' | 'rect' }> | null)
                                ?.ry ?? 0
                        }
                        onUpdate={(value) => props.onUpdate({ ry: value })}
                        min={10}
                        max={100}
                    />
                </Show>
            </Container>
        </Container>
    );
};
