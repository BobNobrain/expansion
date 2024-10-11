import { type JSX, type ParentComponent } from 'solid-js';
import { Container } from '../../../components/Container/Container';
import { TouchNavBar, type TouchNavBarItem } from '../TouchNavBar/TouchNavBar';
import styles from './TouchPage.module.css';

export type TouchPageProps = {
    padded?: boolean;
    hasGap?: boolean;
    header?: JSX.Element;
    footerItems: TouchNavBarItem[];
    stretch?: boolean;
};

export const TouchPage: ParentComponent<TouchPageProps> = (props) => {
    return (
        <div class={styles.page}>
            <header class={styles.header}>{props.header}</header>
            <main
                class={styles.content}
                classList={{
                    [styles.stretch]: props.stretch,
                }}
            >
                <Container direction="column" size="l" padded={props.padded} hasGap={props.hasGap}>
                    {props.children}
                </Container>
            </main>
            <footer class={styles.footer}>
                <TouchNavBar items={props.footerItems} />
            </footer>
        </div>
    );
};
