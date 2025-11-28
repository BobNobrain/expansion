import { createMemo, Show, type Component } from 'solid-js';
import { TabContent, TabsList, type TabHeader } from '@/atoms';
import { IconConstruction, IconFactory, IconPeople, IconStorage } from '@/icons';
import {
    FactoryDisplay,
    FactoryDisplayConstruction,
    FactoryDisplayEquipment,
    FactoryDisplayProduction,
    FactoryDisplayWorkforce,
} from '@/components/FactoryDisplay';
import { World } from '@/domain/World';
import { CreateFactoryTab, getCreateFactoryRoute, useCreateFactoryRouteInfo } from '@/routes/factories';
import { dfBases } from '@/store/datafront';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import {
    TouchFooterActionButton,
    TouchFooterActionLink,
    TouchFooterActions,
} from '@/touch/components/TouchFooterActions/TouchFooterActions';
import { usePageContextBinding } from '@/touch/components/TouchPage';

export const CreateFactoryPage: Component = () => {
    const routeInfo = useCreateFactoryRouteInfo();
    const base = dfBases.useSingle(() => routeInfo().baseId);

    usePageContextBinding(() => {
        const baseContent = base.result();
        const route = routeInfo();

        return {
            title: 'Create Factory',
            subtitle: baseContent ? World.formatGalacticTileId(baseContent.worldId, baseContent.tileId) : undefined,

            customFooter: () => {
                return (
                    <TouchFooterActions>
                        <TouchFooterActionButton text="Save" />
                        <Show
                            when={route.tab === CreateFactoryTab.Construction}
                            fallback={
                                <TouchFooterActionLink
                                    href={getCreateFactoryRoute({ ...route, tab: CreateFactoryTab.Construction })}
                                    text="Continue"
                                    color="semiprimary"
                                />
                            }
                        >
                            <TouchFooterActionButton text="Construct" color="primary" />
                        </Show>
                    </TouchFooterActions>
                );
            },
        };
    });

    const tabs = createMemo<TabHeader[]>(() => {
        const route = routeInfo();

        return [
            {
                title: 'Production',
                icon: IconFactory,
                href: getCreateFactoryRoute({ ...route, tab: CreateFactoryTab.Production }),
            },
            {
                title: 'Inventory',
                icon: IconStorage,
                href: getCreateFactoryRoute({ ...route, tab: CreateFactoryTab.Inventory }),
            },
            {
                title: 'Workforce',
                icon: IconPeople,
                href: getCreateFactoryRoute({ ...route, tab: CreateFactoryTab.Workforce }),
            },
            {
                title: 'Construction',
                icon: IconConstruction,
                href: getCreateFactoryRoute({ ...route, tab: CreateFactoryTab.Construction }),
            },
        ];
    });

    return (
        <TouchContentSingle>
            <TabsList style="pagetop" scrollable tabs={tabs()} />
            <FactoryDisplay
                factory={null}
                editable
                isLoading={false}
                availableArea={500}
                tileConditions={{
                    resources: [],
                    atmosphericResources: [],
                    oceanResources: [],
                    soilFertility: -1,
                }}
                dynamicRecipes={{}}
            >
                <TabContent
                    active={routeInfo().tab}
                    components={{
                        [CreateFactoryTab.Production]: FactoryDisplayEquipment,
                        [CreateFactoryTab.Inventory]: FactoryDisplayProduction,
                        [CreateFactoryTab.Workforce]: FactoryDisplayWorkforce,
                        [CreateFactoryTab.Construction]: FactoryDisplayConstruction,
                    }}
                />
            </FactoryDisplay>
        </TouchContentSingle>
    );
};
