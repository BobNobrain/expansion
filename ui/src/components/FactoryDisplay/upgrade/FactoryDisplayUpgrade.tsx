import { createMemo, For, Show, type Component } from 'solid-js';
import {
    Badge,
    Button,
    Container,
    DefinitionList,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
    Text,
    type DefinitionListItem,
} from '@/atoms';
import { ContributionSlider } from '@/components/ContributionSlider/ContributionSlider';
import { Factory } from '@/domain/Base';
import { Contribution } from '@/domain/Contribution';
import { useFactoryDisplayContext } from '../state';
import { formatInteger } from '@/lib/strings';
import { useAsset } from '@/lib/solid/asset';
import { buildingsAsset } from '@/lib/assetmanager';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { IconArea, IconEquipment, IconHammer, IconUnknown } from '@/icons';
import { createContributionState } from './contribution';
import { ContributionHistory } from '@/components/ContributionHistory/ContributionHistory';

type UpgradeInfo = {
    deltaEquipment: number;
    deltaArea: number;
    lastUpdate: Date;
    hasStarted: boolean;
};

const DEFS: DefinitionListItem<UpgradeInfo>[] = [
    {
        title: 'Equipment',
        render: ({ deltaEquipment }) => {
            return (
                <Badge style="transparent" iconLeft={IconEquipment}>
                    <Text color={deltaEquipment > 0 ? 'success' : 'warn'}>
                        {formatInteger(deltaEquipment, { explicitPlusSign: true })}
                    </Text>
                </Badge>
            );
        },
    },
    {
        title: 'Area',
        render: ({ deltaArea }) => {
            return (
                <Badge style="transparent" iconLeft={IconArea}>
                    <Text color={deltaArea > 0 ? 'success' : 'warn'}>
                        {formatInteger(deltaArea, { explicitPlusSign: true })}
                    </Text>
                </Badge>
            );
        },
    },
    {
        title: 'Updated',
        render: ({ lastUpdate }) => <GameTimeLabel value={lastUpdate} />,
    },
    {
        title: 'Status',
        render: ({ hasStarted }) => {
            return (
                <Show when={hasStarted} fallback={<Text color="primary">PLANNED</Text>}>
                    <Text color="accent">IN PROGRESS</Text>
                </Show>
            );
        },
    },
];

export const FactoryDisplayUpgrade: Component = () => {
    const { onUpgrade, factory, isLoading, baseInventory, isSubmittingContribution, onSubmitContribution } =
        useFactoryDisplayContext();
    const buildings = useAsset(buildingsAsset);

    const info = createMemo((): UpgradeInfo | null => {
        const f = factory();
        const buildingsData = buildings();
        if (!f || !buildingsData) {
            return null;
        }

        const current = Factory.getCurrentConfiguration(f);
        const upgraded = Factory.getUpgradeConfiguration(f);

        return {
            deltaEquipment: Factory.getTotalEquipmentCount(upgraded) - Factory.getTotalEquipmentCount(current),
            deltaArea: Factory.getTotalArea(buildingsData, upgraded) - Factory.getTotalArea(buildingsData, current),
            lastUpdate: f.upgradeProject.lastUpdated,
            hasStarted: Factory.isUpgradeInProgress(f),
        };
    });

    const contribution = createMemo(() => factory()?.upgradeProject.contribution ?? Contribution.empty());
    const { currentCounts, fillAll, sliders, isSelectionEmpty } = createContributionState(contribution, baseInventory);

    const canEditUpgrade = () => {
        const f = factory();
        if (!f) {
            return true;
        }

        return !Factory.isUpgradeInProgress(f);
    };

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Upgrade</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button
                        style="light"
                        onClick={(ev) => {
                            const f = factory();
                            if (f === null) {
                                return;
                            }

                            onUpgrade(f, ev);
                        }}
                    >
                        {canEditUpgrade() ? 'Edit' : 'View'}
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <DefinitionList value={info()} items={DEFS} isLoading={isLoading()} />

            <PageHeader>
                <PageHeaderTitle>Contribute</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light" onClick={fillAll}>
                        <IconUnknown size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        color="primary"
                        disabled={isSelectionEmpty()}
                        loading={isSubmittingContribution()}
                        onClick={() => {
                            onSubmitContribution(currentCounts());
                        }}
                    >
                        <IconHammer size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Container direction="column" hasGap>
                <For each={sliders()}>
                    {(row) => {
                        return (
                            <ContributionSlider
                                commodity={row.commodity}
                                provided={row.provided}
                                total={row.total}
                                value={row.current()}
                                available={row.available()}
                                onUpdate={row.setCurrent}
                            />
                        );
                    }}
                </For>
            </Container>

            <PageHeader>
                <PageHeaderTitle>History</PageHeaderTitle>
            </PageHeader>
            <ContributionHistory history={contribution().contributions} />
        </>
    );
};
