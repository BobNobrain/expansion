import { createEffect, createSignal, Show, type ParentProps } from 'solid-js';
import { type DatafrontError } from '@/lib/datafront/types';
import styles from './Form.module.css';

export type FormProps = {
    loading?: boolean;
    error?: DatafrontError | null;
    onSubmit?: () => void;
};

export function Form(props: ParentProps<FormProps>) {
    const handleSubmit = (ev: Event) => {
        ev.preventDefault();
        props.onSubmit?.();
    };
    const [isErrorOverlayHidden, setErrorOverlayHidden] = createSignal(false);

    createEffect(() => {
        if (props.error) {
            setErrorOverlayHidden(false);
        }
    });
    const hideErrorOverlay = () => setErrorOverlayHidden(true);

    return (
        <form
            class={styles.form}
            classList={{
                [styles.loading]: props.loading,
            }}
            onSubmit={handleSubmit}
        >
            <div
                class={styles.overlayLoading}
                classList={{
                    [styles.overlayVisible]: props.loading,
                }}
            />
            <div
                class={styles.overlayError}
                classList={{
                    [styles.overlayVisible]: Boolean(props.error) && !isErrorOverlayHidden(),
                }}
                onClick={hideErrorOverlay}
            >
                <Show when={props.error}>{props.error!.message}</Show>
            </div>
            {props.children}
        </form>
    );
}
