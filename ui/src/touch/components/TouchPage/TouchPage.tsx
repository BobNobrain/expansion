import { type JSX, type ParentComponent } from 'solid-js';
import styles from './TouchPage.module.css';
import { Container } from '../../../components/Container/Container';

export type TouchPageProps = {
    padded?: boolean;
    hasGap?: boolean;
    header?: JSX.Element;
    stretch?: boolean;
};

export const TouchPage: ParentComponent<TouchPageProps> = (props) => {
    return (
        <div class={styles.page}>
            <div class={styles.header}>{props.header}</div>
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
        </div>
    );
};
