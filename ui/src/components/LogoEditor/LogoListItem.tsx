import { createMemo, type Component } from 'solid-js';
import { Button, ListItem, ListItemContent } from '@/atoms';
import type { CompanyLogoElement } from '@/domain/Company';
import { IconArea, IconChevronRight, IconNametag, IconOrbit } from '@/icons';
import styles from './LogoEditor.module.css';

export const LogoListItem: Component<{
    element: CompanyLogoElement;
    selected: boolean;
    onClick: (ev: MouseEvent) => void;
    onColorClick: () => void;

    canSwapUp: boolean;
    onSwapUp: () => void;
    canSwapDown: boolean;
    onSwapDown: () => void;
}> = (props) => {
    const content = createMemo(() => {
        const element = props.element;
        const description: string[] = [`x: ${element.x}`, `y: ${element.y}`];
        const actions = (
            <>
                <button
                    style={{ '--swatch-color': element.c }}
                    class={styles.elementColorButton}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        props.onColorClick();
                    }}
                />
                <div class={styles.elementSwapButtons}>
                    <Button
                        size="s"
                        square
                        style="text"
                        disabled={!props.canSwapUp}
                        onClick={props.onSwapUp}
                        stopPropagation
                    >
                        <IconChevronRight rotate={-90} size={16} />
                    </Button>
                    <Button
                        size="s"
                        square
                        style="text"
                        disabled={!props.canSwapDown}
                        onClick={props.onSwapDown}
                        stopPropagation
                    >
                        <IconChevronRight rotate={90} size={16} />
                    </Button>
                </div>
            </>
        );

        switch (element.type) {
            case 'ellipse':
                description.push(`rx: ${element.rx}`, `ry: ${element.ry}`);

                return (
                    <ListItemContent
                        title="Ellipse"
                        icon={IconOrbit}
                        subtitle={description.join('; ')}
                        actions={actions}
                    />
                );

            case 'rect':
                description.push(`rx: ${element.rx}`, `ry: ${element.ry}`);
                return (
                    <ListItemContent
                        title="Rectangle"
                        icon={IconArea}
                        subtitle={description.join('; ')}
                        actions={actions}
                    />
                );

            case 'text':
                description.push(`text: "${element.text}"`);
                return (
                    <ListItemContent
                        title="Label"
                        icon={IconNametag}
                        subtitle={description.join('; ')}
                        actions={actions}
                    />
                );
        }
    });

    return (
        <ListItem selected={props.selected} onClick={props.onClick}>
            {content()}
        </ListItem>
    );
};
