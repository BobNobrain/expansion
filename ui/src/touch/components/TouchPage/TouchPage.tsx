import { type JSX, type ParentComponent } from 'solid-js';
import styles from './TouchPage.module.css';

export type TouchPageProps = {
    header?: JSX.Element;
    footer: JSX.Element;
};

export const TouchPage: ParentComponent<TouchPageProps> = (props) => {
    return (
        <div class={styles.wrapper}>
            <header class={styles.header}>{props.header}</header>
            <div class={styles.page}>{props.children}</div>
            <footer class={styles.footer}>{props.footer}</footer>
        </div>
    );
};
