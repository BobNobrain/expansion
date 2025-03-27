import { type Component, createMemo, createSignal } from 'solid-js';
import { renderGameTime, renderGameTimeRelative } from '../../domain/GameTime';
import { useNow } from '../../lib/solid/useNow';
import { Text, type TextProps } from '../Text/Text';
import { renderRealTime, renderRealTimeRelative } from '../../lib/time';

export type GameTimeLabelMode = 'gameAbsolute' | 'gameRelative' | 'realAbsolute' | 'realRelative';

export type GameTimeLabelProps = Omit<TextProps, 'children'> & {
    value: Date | null;
    mode?: GameTimeLabelMode;
    nullText?: string;
};

// TODO: put this into user settings
const [globalMode, setGlobalMode] = createSignal<GameTimeLabelMode>('gameAbsolute');

const transitions: Record<GameTimeLabelMode, GameTimeLabelMode> = {
    gameAbsolute: 'gameRelative',
    gameRelative: 'realAbsolute',
    realAbsolute: 'realRelative',
    realRelative: 'gameAbsolute',
};
const nextGlobalMode = (prev: GameTimeLabelMode) => transitions[prev];

export const GameTimeLabel: Component<GameTimeLabelProps> = (props) => {
    const now = useNow();

    const text = createMemo(() => {
        const date = props.value;
        if (!date) {
            return props.nullText ?? '--';
        }

        const mode = props.mode ?? globalMode();
        switch (mode) {
            case 'gameAbsolute':
                return renderGameTime(date);

            case 'gameRelative':
                return renderGameTimeRelative(date, now());

            case 'realAbsolute':
                return renderRealTime(date);

            case 'realRelative':
                return renderRealTimeRelative(date, now());
        }
    });

    const toggleMode = (ev: MouseEvent) => {
        if (props.mode) {
            return;
        }

        ev.stopPropagation();
        setGlobalMode(nextGlobalMode);
    };

    return (
        <Text {...props} onClick={toggleMode}>
            {text()}
        </Text>
    );
};
