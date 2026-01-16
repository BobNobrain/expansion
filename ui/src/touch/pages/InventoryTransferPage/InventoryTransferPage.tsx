import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { TabContent } from '@/atoms';
import {
    InventoryTransferForm,
    InventoryTransferSelection,
    InventoryTransferAdjustment,
    type InventoryTransferFormResult,
} from '@/components/InventoryTransferForm';
import { Storage, StorageType } from '@/domain/Inventory';
import { useFormController } from '@/lib/solid/form';
import { inventoryTransferRoute, InventoryTransferTab } from '@/routes/transfer';
import { useRouteInfo } from '@/routes/utils';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import {
    TouchFooterActionButton,
    TouchFooterActionLink,
    TouchFooterActions,
    type TouchFooterActionColor,
} from '@/touch/components/TouchFooterActions/TouchFooterActions';
import { usePageContextBinding } from '@/touch/components/TouchPage';
import { dfBasesByLocation, dfFactoriesByBaseId, dfTransferFactoryItems } from '@/store/datafront';
import { World } from '@/domain/World';
import { createIdempotencyToken, useSingleEntity } from '@/lib/datafront/utils';
import { createBlinker } from '@/lib/solid/blink';
import type { DfActionPayload } from '@/lib/datafront/types';

export const InventoryTransferPage: Component = () => {
    const routeInfo = useRouteInfo(inventoryTransferRoute);
    const [searchParams] = useSearchParams<{ sourceId?: string }>();
    const navigate = useNavigate();

    const formController = useFormController<InventoryTransferFormResult>();

    const tileBases = dfBasesByLocation.use(() => {
        const location = routeInfo().location;
        const parsed = World.parseGalacticTileId(location);
        if (!parsed) {
            return null;
        }

        return {
            worldId: parsed.worldId,
            tileId: parsed.tileIndex,
        };
    });
    const tileBaseSingle = useSingleEntity(tileBases);

    const tileFactories = dfFactoriesByBaseId.use(() => {
        const base = tileBaseSingle();
        if (!base) {
            return null;
        }

        return { baseId: base.id };
    });

    const availableStorages = createMemo((): Storage[] => {
        const base = tileBaseSingle();
        const factories = Object.values(tileFactories.result());
        const location = routeInfo().location;
        const parsed = World.parseGalacticTileId(location);

        const result: Storage[] = [];

        if (base !== null) {
            result.push(Storage.fromBaseContent(base));
        }

        if (factories.length && parsed) {
            result.push(
                ...factories.map((f) => Storage.fromFactory(f, { worldId: parsed.worldId, tileId: parsed.tileId })),
            );
        }

        return result;
    });

    const idempotencyToken = createIdempotencyToken();
    const transferAction = dfTransferFactoryItems.use(idempotencyToken.getToken);
    const submitButtonColor = createBlinker<TouchFooterActionColor>({ initialValue: 'primary', durationMs: 500 });

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
                    fallback={
                        <TouchFooterActionButton
                            color={submitButtonColor.getValue()}
                            text="Confirm"
                            onClick={() => {
                                const result = formController.validateAndGetResult();
                                if (!result) {
                                    submitButtonColor.blink('error');
                                    return;
                                }

                                idempotencyToken.aquire();
                                transferAction.run(getTransferPayload(result), {
                                    onError: () => {
                                        submitButtonColor.blink('error');
                                        idempotencyToken.release();
                                    },
                                    onSuccess: () => {
                                        submitButtonColor.blink('success');
                                        idempotencyToken.release();
                                    },
                                });
                            }}
                        />
                    }
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
            <InventoryTransferForm
                sourceId={searchParams.sourceId || null}
                storages={availableStorages()}
                isLoading={tileBases.isLoading() || tileFactories.isLoading() || transferAction.isLoading()}
                controllerRef={formController.ref}
            >
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

function getTransferPayload(result: InventoryTransferFormResult) {
    const payload: DfActionPayload<typeof dfTransferFactoryItems> = {
        factoryId: -1,
        amounts: result.selection,
        fromFactoryToBase: false,
    };
    switch (Storage.getStorageTypeFromId(result.sourceStorageId)) {
        case StorageType.Factory:
            payload.factoryId = Storage.extractFactoryId(result.sourceStorageId)!;
            payload.fromFactoryToBase = true;
            break;

        case StorageType.Base:
            payload.factoryId = Storage.extractFactoryId(result.targetStorageId)!;
            payload.fromFactoryToBase = false;
            break;
    }

    return payload;
}
