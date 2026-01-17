import { createMemo, For, type Component } from 'solid-js';
import {
    Button,
    Container,
    InfoDisplay,
    List,
    ListItem,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
} from '@/atoms';
import { Inventory, Storage } from '@/domain/Inventory';
import { IconArrowLeftLimit, IconArrowRightLimit } from '@/icons';
import { useNow } from '@/lib/solid/useNow';
import { ContributionSlider } from '../ContributionSlider/ContributionSlider';
import { useFormContext } from './state';
import { TransferSelector } from './TransferSelector';

export const InventoryTransferAdjustment: Component = () => {
    const { state, selectedSource, selectedCommodityIds, updateState } = useFormContext();
    const now = useNow('10s');

    const sliders = createMemo(() => {
        const cids = Array.from(selectedCommodityIds());

        return cids.map((cid) => {
            return {
                cid,
                available: () => {
                    const storage = selectedSource();
                    if (!storage) {
                        return 0;
                    }

                    return Storage.getCommodityAmount(storage, cid, now());
                },
                current: () => state.selection[cid],
            };
        });
    });

    return (
        <Container padded>
            <TransferSelector />

            <PageHeader>
                <PageHeaderTitle>Adjust amounts</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button
                        square
                        style="light"
                        onClick={() => {
                            updateState('selection', (selection) => {
                                const clone = Inventory.clone(selection);
                                for (const cid of Object.keys(Inventory.counts(selection))) {
                                    clone[cid] = 0;
                                }

                                return clone;
                            });
                        }}
                    >
                        <IconArrowLeftLimit size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        onClick={() => {
                            updateState(({ selection }) => {
                                const storage = selectedSource();
                                if (!storage) {
                                    return {};
                                }

                                const now = new Date();
                                const newSelection = Inventory.clone(selection);

                                for (const cid of Object.keys(selection)) {
                                    newSelection[cid] = Storage.getCommodityAmount(storage, cid, now);
                                }

                                return { selection: newSelection };
                            });
                        }}
                    >
                        <IconArrowRightLimit size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <List striped inset>
                <For
                    each={sliders()}
                    fallback={
                        <InfoDisplay title="No items selected">
                            You need to select items you want to transfer on the previous screen.
                        </InfoDisplay>
                    }
                >
                    {({ cid, available, current }) => {
                        return (
                            <ListItem>
                                <ContributionSlider
                                    commodity={cid}
                                    provided={0}
                                    total={available()}
                                    value={current()}
                                    available={available()}
                                    onUpdate={(value) => {
                                        updateState('selection', cid, value);
                                    }}
                                    labels="transfer"
                                />
                            </ListItem>
                        );
                    }}
                </For>
            </List>
        </Container>
    );
};
