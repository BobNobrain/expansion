import { type Component, createMemo, type JSX } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import { Text } from '../Text/Text';
import styles from './ProgressBar.module.css';

export type ProgressBarProps = {
    /** 0..1 */
    value: number;
    color?: SemanticColor;
};

export const ProgressBar: Component<ProgressBarProps> = (props) => {
    const label = createMemo(() => {
        const percentage = props.value * 100;
        return `${percentage.toFixed(0)}%`;
    });

    const style = createMemo<JSX.CSSProperties>(() => ({
        width: props.value * 100 + '%',
    }));

    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles[props.color ?? 'secondary']]: true,
            }}
        >
            <div class={styles.bar}>
                <div class={styles.fill} style={style()} />
            </div>
            <Text size="small" color={props.color ?? 'secondary'}>
                {label()}
            </Text>
        </div>
    );
};
