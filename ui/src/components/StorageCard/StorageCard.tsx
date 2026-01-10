import { createMemo, Show, type Component } from 'solid-js';
import { SkeletonText, Text } from '@/atoms';
import { type Storage, StorageType } from '@/domain/Inventory';
import styles from './StorageCard.module.css';
import { IconFactory, IconFlag, IconStorage, type Icon } from '@/icons';
import { Dynamic } from 'solid-js/web';

export type StorageCardProps = {
    storage: Storage | null;
    isLoading?: boolean;
    fallbackName?: string;
    selectable?: boolean;
    onClick?: (ev: MouseEvent) => void;
};

const iconsByStorageType: Record<StorageType, Icon> = {
    [StorageType.Base]: IconFlag,
    [StorageType.Factory]: IconFactory,
};

export function getStorageTypeIcon(type: StorageType | undefined): Icon {
    return (type && iconsByStorageType[type]) || IconStorage;
}

export function getStorageTypeDescription(type: StorageType): string {
    switch (type) {
        case StorageType.Base:
            return 'Base Storage';

        case StorageType.Factory:
            return 'Factory Storage';
    }
}

export const StorageCard: Component<StorageCardProps> = (props) => {
    const title = createMemo(() => props.storage?.name ?? props.fallbackName ?? '--');
    const subtitle = createMemo((): string => {
        if (!props.storage) {
            return '(not selected)';
        }

        return getStorageTypeDescription(props.storage.type);
    });

    const icon = createMemo(() => {
        return getStorageTypeIcon(props.storage?.type);
    });

    return (
        <div
            class={styles.card}
            classList={{
                [styles.selectable]: props.selectable,
            }}
            onClick={props.onClick}
        >
            <div class={styles.title}>
                <Dynamic component={icon()} size={24} block />
                <Text size="large" class={styles.titleText}>
                    <Show when={props.isLoading} fallback={title()}>
                        <SkeletonText length={10} />
                    </Show>
                </Text>
            </div>
            <Text class={styles.subtitle}>
                <Show when={props.isLoading} fallback={subtitle()}>
                    <SkeletonText length={12} />
                </Show>
            </Text>
        </div>
    );
};
