import { type JSX, type ParentComponent } from 'solid-js';
import { TouchNavBar, type TouchNavBarItem } from '../TouchNavBar/TouchNavBar';
import styles from './TouchPage.module.css';

export type TouchPageProps = {
    header?: JSX.Element;
    footerItems: TouchNavBarItem[];
};

export const TouchPage: ParentComponent<TouchPageProps> = (props) => {
    return (
        <div class={styles.wrapper}>
            <header class={styles.header}>{props.header}</header>
            <div class={styles.page}>{props.children}</div>
            <footer class={styles.footer}>
                <TouchNavBar items={props.footerItems} />
            </footer>
        </div>
    );
};
