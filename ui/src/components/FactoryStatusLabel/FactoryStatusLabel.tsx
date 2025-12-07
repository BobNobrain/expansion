import { createMemo, type Component, type JSX } from 'solid-js';
import { SkeletonText, Text } from '@/atoms';
import { Factory, FactoryStatus } from '@/domain/Base';

export type FactoryStatusLabelProps = {
    factory: Pick<Factory, 'status' | 'equipment' | 'upgradeProject'> | null;
    isLoading?: boolean;
};

export const FactoryStatusLabel: Component<FactoryStatusLabelProps> = (props) => {
    const status = createMemo((): JSX.Element => {
        if (!props.factory || props.isLoading) {
            return <SkeletonText length={6} />;
        }

        switch (props.factory.status) {
            case FactoryStatus.Disabled:
                return <Text color="warn">PAUSED</Text>;
            case FactoryStatus.Halted:
                return (
                    <Text color="error" bold>
                        HALTED
                    </Text>
                );

            default:
                if (Factory.hasUpgradePlanned(props.factory)) {
                    return <Text color="success">{props.factory.equipment.length ? 'UPGRD' : 'DRAFT'}</Text>;
                }
                if (Factory.isUpgradeInProgress(props.factory)) {
                    return <Text color="accent">CONSTR</Text>;
                }

                if (props.factory.equipment.length === 0) {
                    return (
                        <Text color="primary" bold>
                            EMPTY
                        </Text>
                    );
                }

                return <Text color="default">ACTIVE</Text>;
        }
    });

    return <>{status()}</>;
};
