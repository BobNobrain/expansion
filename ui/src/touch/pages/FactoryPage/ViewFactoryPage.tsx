import { createMemo, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { type TabHeader, TabsList, TabContent } from '@/atoms';
import {
    FactoryDisplay,
    FactoryDisplayEquipment,
    FactoryDisplayWorkforce,
    FactoryDisplayOverview,
    FactoryDisplayUpgrade,
} from '@/components/FactoryDisplay';
import { Factory } from '@/domain/Base';
import type { Inventory } from '@/domain/Inventory';
import { World } from '@/domain/World';
import { IconFactory, IconPeople, IconEquipment, IconUnknown } from '@/icons';
import { createIdempotencyToken } from '@/lib/datafront/utils';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { getBasesRoute } from '@/routes/bases';
import { ViewFactoryTab, getEditFactoryRoute, getViewFactoryRoute, useViewFactoryRouteInfo } from '@/routes/factories';
import { dfContributeToFactory, dfRebalanceFactory } from '@/store/datafront';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import { usePageContextBinding } from '@/touch/components/TouchPage';
import { useFactoryRelatedData } from './hooks';
import type { FactoryDisplayRebalanceResult } from '@/components/FactoryDisplay/state';

export const ViewFactoryPage: Component = () => {
    const routeInfo = useViewFactoryRouteInfo();
    const navigate = useNavigate();
    const { base, dynamicRecipes, factory, tileConditions, isFactoryLoading, baseInventory } =
        useFactoryRelatedData(routeInfo);

    usePageContextBinding(() => {
        const baseContent = base.result();

        return {
            title: 'Factory',
            subtitle: baseContent ? World.formatGalacticTileId(baseContent.worldId, baseContent.tileId) : undefined,
            goBack: (historyBack) => {
                if (historyBack) {
                    historyBack();
                    return;
                }

                const baseData = base.result();
                if (baseData !== null) {
                    navigate(getBasesRoute({ worldId: baseData.worldId, tileId: baseData.tileId }));
                    return;
                }
            },
        };
    });

    const tabs = createMemo((): TabHeader[] => {
        const route = routeInfo();
        const f = factory.result();

        const addUpgradeTab = f !== null && Factory.hasUpgradePlanned(f);

        return [
            {
                title: 'Overview',
                icon: IconFactory,
                href: getViewFactoryRoute({ ...route, tab: ViewFactoryTab.Overview }),
            },
            addUpgradeTab
                ? {
                      title: 'Upgrade',
                      icon: IconUnknown,
                      href: getViewFactoryRoute({ ...route, tab: ViewFactoryTab.Upgrade }),
                  }
                : null,
            {
                title: 'Production',
                icon: IconEquipment,
                href: getViewFactoryRoute({ ...route, tab: ViewFactoryTab.Production }),
            },
            {
                title: 'Workforce',
                icon: IconPeople,
                href: getViewFactoryRoute({ ...route, tab: ViewFactoryTab.Workforce }),
            },
        ].filter(Boolean as unknown as <T>(x: T | null) => x is T);
    });

    const contributeIdempotencyToken = createIdempotencyToken();
    const contribute = dfContributeToFactory.use(contributeIdempotencyToken.getToken);
    const onContributeClick = (amounts: Inventory) => {
        const f = factory.result();
        if (!f) {
            return;
        }

        contributeIdempotencyToken.aquire();
        contribute.run(
            { factoryId: f.id, amounts },
            {
                onSuccess: contributeIdempotencyToken.release,
                onError: contributeIdempotencyToken.release,
            },
        );
    };

    const rebalance = dfRebalanceFactory.use(() => Date.now().toString());
    const onRebalanceClick = (result: FactoryDisplayRebalanceResult) => {
        const f = factory.result();
        if (!f) {
            return;
        }

        if (rebalance.isLoading()) {
            return;
        }

        rebalance.run({
            factoryId: f.id,
            plan: result.target.map((eq) =>
                eq.production.map((p) => ({ recipeId: p.recipeId, manualEfficiency: p.manualEfficiency })),
            ),
        });
    };

    return (
        <TouchContentSingle>
            <TabsList style="pagetop" scrollable tabs={tabs()} />
            <FactoryDisplay
                factory={factory.result()}
                editable={false}
                isLoading={isFactoryLoading()}
                availableArea={500}
                tileId={base.result()?.tileId ?? null}
                worldId={base.result()?.worldId ?? null}
                baseInventory={baseInventory()}
                tileConditions={tileConditions()}
                dynamicRecipes={dynamicRecipes()}
                onUpgrade={(f, ev) => {
                    let href: string;
                    let replace = false;
                    if (Factory.hasUpgradePlanned(f) && routeInfo().tab !== ViewFactoryTab.Upgrade) {
                        href = getViewFactoryRoute({ factoryId: f.id, tab: ViewFactoryTab.Upgrade });
                        replace = true;
                    } else {
                        href = getEditFactoryRoute({ factoryId: f.id });
                    }

                    emulateLinkClick({ navigate, href, replace }, ev);
                }}
                onSubmitContribution={onContributeClick}
                isSubmittingContribution={contribute.isLoading()}
                isRebalanceInProgress={rebalance.isLoading()}
                onRebalance={onRebalanceClick}
            >
                <TabContent
                    active={routeInfo().tab}
                    components={{
                        [ViewFactoryTab.Overview]: FactoryDisplayOverview,
                        [ViewFactoryTab.Upgrade]: FactoryDisplayUpgrade,
                        [ViewFactoryTab.Production]: FactoryDisplayEquipment,
                        [ViewFactoryTab.Workforce]: FactoryDisplayWorkforce,
                    }}
                />
            </FactoryDisplay>
        </TouchContentSingle>
    );
};
