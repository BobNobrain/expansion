import { createMemo, type Component, Show } from 'solid-js';
import { registerInFormContext } from '@/atoms/Form';
import { type RGBColor, Color } from '@/lib/color';
import styles from './ColorInput.module.css';

export type ColorInputProps = {
    value: Color;
    onUpdate: (c: RGBColor) => void;

    alpha?: 'optional' | 'required' | 'forbidden';

    formKey?: string;
};

export const ColorInput: Component<ColorInputProps> = (props) => {
    const hexColor = createMemo(() => Color.toHexString(props.value, { stripAlpha: true }));

    const onInput = (ev: InputEvent) => {
        const newValue = (ev.target as HTMLInputElement).value;
        const rgb = Color.toRGB(newValue);
        switch (props.alpha) {
            case 'optional':
                rgb.a = Color.toRGB(props.value).a;
                break;

            case 'required':
                rgb.a = Color.toRGB(props.value).a ?? 1;
                break;
        }
        props.onUpdate(rgb);
    };

    registerInFormContext(props, {});

    return (
        <div class={styles.wrapper}>
            <label class={styles.label}>
                <span
                    class={styles.icon}
                    style={{
                        '--color-input-value': hexColor(),
                    }}
                ></span>
                <input type="color" value={hexColor()} onInput={onInput} class={styles.input} />
                <span>{hexColor()}</span>
            </label>
            <Show when={props.alpha !== 'forbidden'}>
                <span>Alpha: {Color.toRGB(props.value).a ?? '–'}</span>
            </Show>
        </div>
    );
};
