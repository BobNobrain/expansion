import { createMemo, createSignal, Show, type Component } from 'solid-js';
import { Badge } from '../../../../components/Badge/Badge';
import { Banner } from '../../../../components/Banner/Banner';
import { Button } from '../../../../components/Button/Button';
import { CommodityIconWithLabel } from '../../../../components/CommodityIcon';
import { Container } from '../../../../components/Container/Container';
import { DataTable, type DataTableColumn } from '../../../../components/DataTable';
import { DefinitionList, type DefinitionListItem } from '../../../../components/DefinitionList/DefinitionList';
import { EquipmentSelectionList } from '../../../../components/EquipmentSelectionList/EquipmentSelectionList';
import { PageHeader, PageHeaderTitle, PageHeaderIcon, PageHeaderActions } from '../../../../components/PageHeader';
import { Text } from '../../../../components/Text/Text';
import { TouchBottomSheet } from '../../../components/TouchBottomSheet/TouchBottomSheet';
import { WorkforceCounts } from '../../../../components/WorkforceCounts/WorkforceCounts';
import { Equipment } from '../../../../domain/Base';
import { WorkforceData } from '../../../../domain/City';
import { Commodity, ConstructionCost } from '../../../../domain/Commodity';
import { IconConstruction, IconArea, IconFactory } from '../../../../icons';
import { buildingsAsset, commoditiesAsset } from '../../../../lib/assetmanager';
import { mapValues } from '../../../../lib/misc';
import { useAsset } from '../../../../lib/solid/asset';
import { type ModalRouteState } from '../../../../routes/modals';

type Props = {
    modal: ModalRouteState;
};

type Step = 'select' | 'confirm';

type SiteInfo = {
    totals: {
        count: number;
        area: number;
    };
    workers: WorkforceData<number>;
};

const DEFS: DefinitionListItem<SiteInfo>[] = [
    {
        title: 'Total',
        render: (v) => (
            <Container direction="row" hasGap>
                <Badge style="transparent" iconLeft={IconFactory}>
                    {v.totals.count.toFixed(0)}
                </Badge>
                <Badge style="transparent" iconLeft={IconArea}>
                    {v.totals.area.toFixed(0)}/1000
                </Badge>
            </Container>
        ),
    },
    {
        title: 'Workforce',
        render: (v) => (
            <Container direction="row" hasGap wrap>
                <WorkforceCounts counts={v.workers} />
            </Container>
        ),
    },
];

type SiteCostRow = {
    commodity: string;
    amount: string;
};

const COLS: DataTableColumn<SiteCostRow>[] = [
    {
        header: { text: 'Commodity' },
        content: (row) => <CommodityIconWithLabel commodity={row.commodity} />,
    },
    {
        header: { text: 'Amount' },
        align: 'right',
        width: 120,
        content: (row) => <Text color="bright">{row.amount}</Text>,
    },
];

export const TileBaseConstructSheet: Component<Props> = (props) => {
    const buildings = useAsset(buildingsAsset);
    const commodities = useAsset(commoditiesAsset);

    const [counts, setCounts] = createSignal<Record<string, number>>({});
    const totalCount = createMemo(() => Object.values(counts()).reduce((acc, next) => acc + next, 0));
    const totalArea = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return 0;
        }

        const c = counts();
        return Object.keys(c).reduce((acc, next) => acc + c[next] * buildingsData.equipment[next].area, 0);
    });

    const totalWorkers = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return WorkforceData.empty<number>();
        }

        const result = WorkforceData.empty<number>();

        for (const [equipmentId, count] of Object.entries(counts())) {
            const eqData = buildingsData.equipment[equipmentId];
            if (!eqData) {
                continue;
            }

            WorkforceData.mix(
                result,
                mapValues(eqData.workforce, (wf) => wf.count * count),
                (a, b) => a + b,
            );
        }

        return result;
    });

    const siteInfo = createMemo<SiteInfo>(() => {
        return { totals: { area: totalArea(), count: totalCount() }, workers: totalWorkers() };
    });

    const siteCosts = createMemo<SiteCostRow[]>(() => {
        const buildingsData = buildings();
        const commoditiesData = commodities();
        if (!buildingsData || !commoditiesData) {
            return [];
        }

        const totalCost = ConstructionCost.empty();

        for (const [equipmentId, count] of Object.entries(counts())) {
            const equipmentCost = Equipment.getConstructionCost(buildingsData, equipmentId, { count });
            ConstructionCost.add(totalCost, equipmentCost);
        }

        return Object.entries(totalCost).map(([commodity, amount]): SiteCostRow => {
            return {
                commodity,
                amount: Commodity.stringifyAmount(commoditiesData[commodity], amount),
            };
        });
    });

    const [getStep, setStep] = createSignal<Step>('select');
    const goToConfirmation = () => setStep('confirm');
    const goToSelection = () => setStep('select');

    return (
        <TouchBottomSheet
            header={
                <PageHeader>
                    <PageHeaderTitle>Construct</PageHeaderTitle>
                    <Show when={getStep() === 'select'}>
                        <PageHeaderIcon icon={IconConstruction} text={totalCount().toFixed(0)} />
                        <PageHeaderIcon icon={IconArea} text={totalArea().toFixed(0)} />
                    </Show>
                    <PageHeaderActions pushRight>
                        <Show when={getStep() === 'select'}>
                            <Button color="primary" disabled={totalCount() === 0} onClick={goToConfirmation}>
                                Continue
                            </Button>
                        </Show>
                        <Show when={getStep() === 'confirm'}>
                            <Button onClick={goToSelection}>Back</Button>
                        </Show>
                    </PageHeaderActions>
                </PageHeader>
            }
            isOpen={props.modal.isOpen()}
            onClose={props.modal.close}
        >
            <Show when={getStep() === 'select'}>
                <EquipmentSelectionList
                    availableArea={80}
                    availableResources={{ soil: 'bad', minerals: 'good', liquids: 'none', gases: 'none' }}
                    selectedCounts={counts()}
                    onCountChange={(id, value) => setCounts((old) => ({ ...old, [id]: value }))}
                />
            </Show>
            <Show when={getStep() === 'confirm'}>
                <Container padded>
                    <Banner color="info" margin="bottom">
                        You are about to start a construction. Review your selection and press the button below to
                        create the construction sites.
                    </Banner>
                    <DefinitionList items={DEFS} value={siteInfo()} inset />
                    <PageHeader>
                        <PageHeaderTitle>Bill of Materials</PageHeaderTitle>
                    </PageHeader>
                    <DataTable columns={COLS} rows={siteCosts()} inset />
                    <Container direction="row" primaryAlignment="center" padded="v">
                        <Button color="primary">Start Construction</Button>
                    </Container>
                </Container>
            </Show>
        </TouchBottomSheet>
    );
};
