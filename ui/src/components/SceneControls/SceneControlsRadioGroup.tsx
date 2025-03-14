import { createSignal, type ParentComponent } from 'solid-js';
import styles from './SceneControls.module.css';
import { type Icon } from '../../icons';
import { SceneControlsButton } from './SceneControlsButton';

export type SceneControlsRadioGroupProps = {
    triggerIcon: Icon;
    activeTriggerIcon?: Icon;
};

export const SceneControlsRadioGroup: ParentComponent<SceneControlsRadioGroupProps> = (props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const toggleOpen = () => setIsOpen((x) => !x);

    return (
        <div class={styles.radioGroup}>
            <div
                class={styles.radioGroupContent}
                classList={{
                    [styles.active]: isOpen(),
                }}
            >
                {props.children}
            </div>
            <div class={styles.radioGroupTrigger}>
                <SceneControlsButton
                    icon={(isOpen() && props.activeTriggerIcon) || props.triggerIcon}
                    isActive={isOpen()}
                    onClick={toggleOpen}
                />
            </div>
        </div>
    );
};
