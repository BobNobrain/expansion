import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { TabContent } from '@/atoms';
import {
    InventoryTransferForm,
    InventoryTransferSelection,
    InventoryTransferAdjustment,
} from '@/components/InventoryTransferForm';
import { type Storage, Inventory, StorageSize, StorageType } from '@/domain/Inventory';
import { createLinearPredictable } from '@/lib/predictables';
import { useFormController } from '@/lib/solid/form';
import { inventoryTransferRoute, InventoryTransferTab } from '@/routes/transfer';
import { useRouteInfo } from '@/routes/utils';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import {
    TouchFooterActionButton,
    TouchFooterActionLink,
    TouchFooterActions,
} from '@/touch/components/TouchFooterActions/TouchFooterActions';
import { usePageContextBinding } from '@/touch/components/TouchPage';

export const InventoryTransferPage: Component = () => {
    const routeInfo = useRouteInfo(inventoryTransferRoute);
    const navigate = useNavigate();

    const formController = useFormController();
    const testNow = new Date();

    const source = createMemo((old): Storage | null => {
        const id = routeInfo().sourceId;
        if (!id) {
            return null;
        }

        if (old?.id === id) {
            return old;
        }

        return {
            id,
            type: StorageType.Factory,
            name: 'Factory A',
            staticContent: Inventory.from({
                limestone: 10,
                steelBeams: 20,
            }),
            dynamicContent: {
                concrete: createLinearPredictable({ t0: testNow, x0: 10, deltaT: { h: 1 }, deltaX: 10 }),
                steel: createLinearPredictable({ t0: testNow, x0: 50, deltaT: { h: 1 }, deltaX: -10 }),
            },
            sizeLimit: StorageSize.infinite(),
        };
    });

    const targets = createMemo((): Storage[] => {
        return [
            {
                id: '1',
                type: StorageType.Factory,
                name: 'Factory B',
                staticContent: Inventory.empty(),
                dynamicContent: null,
                sizeLimit: StorageSize.infinite(),
            },
            {
                id: '2',
                type: StorageType.Base,
                name: 'Base',
                staticContent: Inventory.empty(),
                dynamicContent: null,
                sizeLimit: StorageSize.infinite(),
            },
        ];
    });

    const Footer: Component = () => {
        return (
            <TouchFooterActions>
                <Show
                    when={routeInfo().tab === InventoryTransferTab.Selection}
                    fallback={
                        <TouchFooterActionButton
                            text="Back"
                            onClick={() =>
                                navigate(
                                    inventoryTransferRoute.render({
                                        ...routeInfo(),
                                        tab: InventoryTransferTab.Selection,
                                    }),
                                    { replace: true },
                                )
                            }
                        />
                    }
                >
                    <TouchFooterActionButton text="Cancel" onClick={() => navigate(-1)} />
                </Show>
                <Show
                    when={routeInfo().tab === InventoryTransferTab.Selection}
                    fallback={<TouchFooterActionButton color="primary" text="Confirm" />}
                >
                    <TouchFooterActionLink
                        href={inventoryTransferRoute.render({ ...routeInfo(), tab: InventoryTransferTab.Adjustment })}
                        replace
                        text="Next"
                        color="semiprimary"
                    />
                </Show>
            </TouchFooterActions>
        );
    };

    usePageContextBinding(() => {
        return {
            title: 'Transfer Items',
            goBack: (historyBack) => {
                if (historyBack) {
                    historyBack();
                    return;
                }

                navigate('/');
            },
            customFooter: Footer,
        };
    });

    return (
        <TouchContentSingle>
            <InventoryTransferForm source={source()} targets={targets()} controllerRef={formController.ref}>
                <TabContent
                    active={routeInfo().tab ?? InventoryTransferTab.Selection}
                    components={{
                        [InventoryTransferTab.Selection]: InventoryTransferSelection,
                        [InventoryTransferTab.Adjustment]: InventoryTransferAdjustment,
                    }}
                />
            </InventoryTransferForm>
        </TouchContentSingle>
    );
};
