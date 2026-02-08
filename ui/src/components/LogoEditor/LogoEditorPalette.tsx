import { For, type Component } from 'solid-js';
import { LOGO_PALETTE } from './palette';
import styles from './LogoEditor.module.css';

export const LogoEditorPalette: Component<{ selected: string | undefined; onSelect: (color: string) => void }> = (
    props,
) => {
    return (
        <div class={styles.palette}>
            <For each={LOGO_PALETTE}>
                {(swatch) => {
                    return (
                        <button
                            style={{ '--swatch-color': swatch }}
                            class={styles.swatch}
                            classList={{
                                [styles.active]: swatch === props.selected,
                            }}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                props.onSelect(swatch);
                            }}
                        ></button>
                    );
                }}
            </For>
        </div>
    );
};
