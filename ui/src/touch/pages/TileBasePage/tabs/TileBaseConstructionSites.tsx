import { createMemo, For, type Component } from 'solid-js';
import { Button } from '../../../../components/Button/Button';
import { ConstructionSite } from '../../../../components/ConstructionSite/ConstructionSite';
import { PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '../../../../components/PageHeader';
import { type BaseConstructionSite } from '../../../../domain/Base';
import { IconConstruction, IconHammer } from '../../../../icons';
import { Container } from '../../../../components/Container/Container';

export const TileBaseConstructionSites: Component = () => {
    const sites = createMemo(() => {
        const sites: BaseConstructionSite[] = [
            {
                id: 42,
                equipment: 'drill',
                area: 80,
                provided: {
                    concrete: 100,
                    steelBeams: 42,
                },
                total: {
                    concrete: 240,
                    constructionPanel: 80,
                    constructionBlocks: 160,
                    steelBeams: 480,
                },
                autoBuild: false,
            },
        ];

        return sites;
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Construction Sites</PageHeaderTitle>
                <PageHeaderIcon icon={IconConstruction} text="2" />
                <PageHeaderActions pushRight>
                    <Button style="light" square>
                        <IconHammer size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>

            <Container direction="column" padded hasGap>
                <For each={sites()}>
                    {(site) => {
                        return <ConstructionSite site={site} availableMaterials={{ concrete: 60, steelBeams: 20 }} />;
                    }}
                </For>
            </Container>
        </>
    );
};
