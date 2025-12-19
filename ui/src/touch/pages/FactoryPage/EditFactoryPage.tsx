import { createEffect, createMemo, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { TabContent, TabsList, type TabHeader } from '@/atoms';
import { IconConstruction, IconFactory, IconPeople, IconStorage } from '@/icons';
import {
    FactoryDisplay,
    FactoryDisplayConstruction,
    FactoryDisplayEquipment,
    FactoryDisplayProduction,
    FactoryDisplayWorkforce,
    type FactoryDisplayEditResult,
} from '@/components/FactoryDisplay';
import { World } from '@/domain/World';
import { useBlink } from '@/lib/solid/blink';
import { getBasesRoute } from '@/routes/bases';
import {
    EditFactoryTab,
    getEditFactoryRoute,
    getViewFactoryRoute,
    useEditFactoryRouteInfo,
    ViewFactoryTab,
} from '@/routes/factories';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import {
    TouchFooterActionButton,
    TouchFooterActionLink,
    TouchFooterActions,
    type TouchFooterActionColor,
} from '@/touch/components/TouchFooterActions/TouchFooterActions';
import { usePageContextBinding } from '@/touch/components/TouchPage';
import { useFactoryRelatedData } from './hooks';
import { dfUpgradeFactory } from '@/store/datafront';
import { createIdempotencyToken } from '@/lib/datafront/utils';
import { useFormController } from '@/lib/solid/form';
import { Factory } from '@/domain/Base';

export const EditFactoryPage: Component = () => {
    const routeInfo = useEditFactoryRouteInfo();
    const navigate = useNavigate();
    const { base, dynamicRecipes, factory, tileConditions, isFactoryLoading, baseInventory } =
        useFactoryRelatedData(routeInfo);

    const formController = useFormController<FactoryDisplayEditResult>();
    createEffect(() => {
        factory.result();
        formController.markClean();
    });

    const saveToken = createIdempotencyToken();
    const saveUpgradePlan = dfUpgradeFactory.use(saveToken.getToken);

    const saveButtonColor = useBlink<TouchFooterActionColor>({ initialValue: 'semiprimary', durationMs: 500 });

    const onSaveClick = () => {
        saveToken.aquire();

        const result = formController.validateAndGetResult();
        if (!result) {
            saveButtonColor.blink('error');
            saveToken.release();
            return;
        }

        saveUpgradePlan.run(
            {
                factoryId: routeInfo().factoryId,
                equipment: result.target.map((t) => {
                    return {
                        equipmentId: t.equipmentId,
                        count: t.count,
                        production: t.production.map((prod) => ({
                            recipeId: prod.recipeId,
                            manualEfficiency: prod.manualEfficiency,
                        })),
                    };
                }),
            },
            {
                onSuccess: () => {
                    saveToken.release();
                    saveButtonColor.blink('success');
                    formController.markClean();
                },
                onError: () => {
                    saveToken.release();
                    saveButtonColor.blink('error', 1000);
                },
            },
        );
    };

    usePageContextBinding(() => {
        const baseContent = base.result();
        const route = routeInfo();

        return {
            title: 'Factory Upgrade',
            subtitle: baseContent ? World.formatGalacticTileId(baseContent.worldId, baseContent.tileId) : undefined,

            customFooter: () => {
                return (
                    <TouchFooterActions>
                        <TouchFooterActionLink
                            href={getViewFactoryRoute({ factoryId: route.factoryId, tab: ViewFactoryTab.Upgrade })}
                            text="Cancel"
                            color="secondary"
                        />
                        <TouchFooterActionButton
                            text={formController.isDirty() ? 'Save' : 'Saved'}
                            onClick={onSaveClick}
                            color={saveButtonColor.getValue()}
                            loading={saveUpgradePlan.isLoading()}
                            disabled={!formController.isDirty()}
                        />
                    </TouchFooterActions>
                );
            },
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

    const tabs = createMemo<TabHeader[]>(() => {
        const route = routeInfo();

        return [
            {
                title: 'Production',
                icon: IconFactory,
                href: getEditFactoryRoute({ ...route, tab: EditFactoryTab.Production }),
            },
            {
                title: 'Inventory',
                icon: IconStorage,
                href: getEditFactoryRoute({ ...route, tab: EditFactoryTab.Inventory }),
            },
            {
                title: 'Workforce',
                icon: IconPeople,
                href: getEditFactoryRoute({ ...route, tab: EditFactoryTab.Workforce }),
            },
            {
                title: 'Construction',
                icon: IconConstruction,
                href: getEditFactoryRoute({ ...route, tab: EditFactoryTab.Construction }),
            },
        ];
    });

    const isEditable = () => {
        const f = factory.result();
        if (!f) {
            return false;
        }

        return !Factory.isUpgradeInProgress(f);
    };

    return (
        <TouchContentSingle>
            <TabsList style="pagetop" scrollable tabs={tabs()} />
            <FactoryDisplay
                factory={factory.result()}
                editable={isEditable()}
                isLoading={isFactoryLoading()}
                availableArea={500}
                tileId={base.result()?.tileId ?? null}
                worldId={base.result()?.worldId ?? null}
                baseInventory={baseInventory()}
                tileConditions={tileConditions()}
                dynamicRecipes={dynamicRecipes()}
                formControllerRef={formController.ref}
            >
                <TabContent
                    active={routeInfo().tab}
                    components={{
                        [EditFactoryTab.Production]: FactoryDisplayEquipment,
                        [EditFactoryTab.Inventory]: FactoryDisplayProduction,
                        [EditFactoryTab.Workforce]: FactoryDisplayWorkforce,
                        [EditFactoryTab.Construction]: FactoryDisplayConstruction,
                    }}
                />
            </FactoryDisplay>
        </TouchContentSingle>
    );
};
