import { type JSX, type Component, Show, createMemo, createSignal } from 'solid-js';
import { registerInFormContext, type ValidationState } from '../Form';
import styles from './TextInput.module.css';
import { InputIcon } from '../InputIcon/InputIcon';

export type TextInputProps = {
    value: string;
    onUpdate: (newValue: string, ev: Event) => void;

    onKeyUp?: (ev: KeyboardEvent) => void;
    onFocus?: (ev: FocusEvent) => void;
    onBlur?: (ev: FocusEvent) => void;

    label?: string;
    suffix?: string;
    prefix?: string;
    placeholder?: string;
    hint?: string | JSX.Element;
    controls?: JSX.Element;

    readonly?: boolean;
    disabled?: boolean;
    password?: boolean;
    clearable?: boolean;
    inputMode?: JSX.InputHTMLAttributes<'text'>['inputMode'];

    formKey?: string;
    validity?: ValidationState;
};

type TextInputVisuals = {
    appearance: 'normal' | 'disabled' | 'success' | 'error';
    hint?: string | JSX.Element;
};

export const TextInput: Component<TextInputProps> = (props) => {
    const [isHintVisible, setIsHintVisible] = createSignal(false);
    let inputRef!: HTMLInputElement;

    const updateValue = (ev: Event) => {
        props.onUpdate((ev.target as HTMLInputElement).value, ev);
    };

    registerInFormContext(props, {});

    const visuals = createMemo<TextInputVisuals>(() => {
        if (props.disabled) {
            return { appearance: 'disabled' };
        }

        const hintText = isHintVisible() ? props.hint : undefined;

        if (props.validity) {
            if (props.validity.type === 'error') {
                return { appearance: 'error', hint: props.validity.message };
            }
            if (props.validity.type === 'ok' && props.validity.explicitSuccess) {
                return { appearance: 'success', hint: props.validity.message ?? hintText };
            }
        }

        return { appearance: 'normal', hint: hintText };
    });

    const toggleHint = (ev: MouseEvent) => {
        ev.stopPropagation();

        if (visuals().appearance !== 'normal') {
            setIsHintVisible(false);
            return;
        }

        setIsHintVisible(!isHintVisible());
    };

    const focusTheInput = (ev: MouseEvent) => {
        if (ev.defaultPrevented) {
            return;
        }

        inputRef.focus();
    };

    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles[visuals().appearance]]: true,
            }}
            onClick={focusTheInput}
        >
            <div class={styles.label}>{props.label}</div>
            <Show when={visuals().appearance === 'error'}>
                <div class={styles.icon}>
                    <InputIcon type="error" />
                </div>
            </Show>
            <Show when={visuals().appearance === 'success'}>
                <div class={styles.icon}>
                    <InputIcon type="success" />
                </div>
            </Show>
            <Show when={visuals().appearance === 'disabled'}>
                <div class={styles.icon} classList={{ [styles.iconLock]: true }}>
                    <InputIcon type="lock" />
                </div>
            </Show>
            <Show when={visuals().appearance === 'normal'}>
                <Show when={props.hint} fallback={<div class={styles.iconPlaceholder} />}>
                    <div class={styles.icon} onClick={toggleHint}>
                        <InputIcon type="hint" />
                    </div>
                </Show>
            </Show>
            <Show when={props.controls}>
                <div class={styles.controls}>{props.controls}</div>
            </Show>
            <Show when={props.prefix}>
                <span class={styles.prefix}>{props.prefix}</span>
            </Show>
            <input
                ref={inputRef}
                class={styles.input}
                value={props.value}
                onInput={updateValue}
                readOnly={props.readonly}
                inputMode={props.inputMode}
                type={props.password ? 'password' : 'text'}
                placeholder={props.placeholder}
                onKeyUp={props.onKeyUp}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
            <Show when={props.suffix}>
                <span class={styles.suffix}>{props.suffix}</span>
            </Show>

            <Show when={visuals().hint}>
                <div
                    class={styles.hint}
                    classList={{
                        [styles[visuals().appearance]]: true,
                    }}
                >
                    {visuals().hint}
                </div>
            </Show>
        </div>
    );
};
