import { createMemo, type Component } from 'solid-js';
import styles from './RatingBox.module.css';

export type RatingColor = 'perfect' | 'good' | 'mid' | 'bad' | 'unknown';

export type RatingBoxProps = {
    rating: string;
    color?: RatingColor;
};

const classesByColor: Record<RatingColor, string> = {
    perfect: styles.perfect,
    good: styles.good,
    mid: styles.mid,
    bad: styles.bad,
    unknown: styles.unknown,
};

export const RatingBox: Component<RatingBoxProps> = (props) => {
    const color = createMemo((): RatingColor => {
        if (props.color) {
            return props.color;
        }

        switch (props.rating[0]) {
            case 'S':
                return 'perfect';
            case 'A':
            case 'B':
                return 'good';

            case 'C':
            case 'D':
                return 'mid';

            case 'E':
            case 'F':
                return 'bad';

            default:
                return 'unknown';
        }
    });

    return (
        <span class={styles.box} classList={{ [classesByColor[color()]]: true }}>
            {props.rating}
        </span>
    );
};
