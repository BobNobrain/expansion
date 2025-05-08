import { createMemo, type ParentComponent } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import styles from './Banner.module.css';

export type BannerMargin = 'top' | 'bottom' | 'v' | 'left' | 'right' | 'h' | 'all' | 'none';

export type BannerProps = {
    color?: SemanticColor;
    margin?: BannerMargin;
};

const margins: Record<BannerMargin, string | undefined> = {
    top: styles.marginTop,
    bottom: styles.marginBottom,
    left: styles.marginLeft,
    right: styles.marginRight,
    v: styles.marginV,
    h: styles.marginH,
    all: styles.marginAll,
    none: undefined,
};

export const Banner: ParentComponent<BannerProps> = (props) => {
    const classList = createMemo(() => {
        const result: Record<string, boolean> = {
            [styles[props.color ?? 'secondary']]: true,
        };

        const marginClass = margins[props.margin ?? 'none'];
        if (marginClass) {
            result[marginClass] = true;
        }

        return result;
    });

    return (
        <div class={styles.banner} classList={classList()}>
            {props.children}
        </div>
    );
};
