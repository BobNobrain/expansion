import { createMemo, type Component } from 'solid-js';
import { TabContent, TabsList, type TabHeader } from '@/atoms';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import { CreateFactoryTab, getCreateFactoryRoute, useCreateFactoryRouteInfo } from '@/routes/factories';
import { IconConstruction, IconFactory, IconPeople, IconStorage } from '@/icons';
import {
    FactoryDisplay,
    FactoryDisplayConstruction,
    FactoryDisplayEquipment,
    FactoryDisplayProduction,
    FactoryDisplayWorkforce,
} from '@/components/FactoryDisplay';

export const CreateFactoryPage: Component = () => {
    const routeInfo = useCreateFactoryRouteInfo();

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
