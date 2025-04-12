import { type JSX, type ParentComponent } from 'solid-js';
import { TouchCurtain, type TouchCurtainProps } from './TouchCurtain/TouchCurtain';
import styles from './TouchContentDouble.module.css';

export type TouchContentDoubleProps = TouchCurtainProps & {
    display: JSX.Element;
};

export const TouchContentDouble: ParentComponent<TouchContentDoubleProps> = (props) => {
    return (
        <main class={styles.double}>
            <div class={styles.display}>{props.display}</div>
            <TouchCurtain {...props}>{props.children}</TouchCurtain>
        </main>
    );
};
