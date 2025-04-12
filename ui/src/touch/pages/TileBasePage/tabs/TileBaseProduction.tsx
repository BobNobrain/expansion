import { type Component } from 'solid-js';
import { Badge } from '../../../../components/Badge/Badge';
import { Button } from '../../../../components/Button/Button';
import { Container, Spacer } from '../../../../components/Container/Container';
import { Group, GroupHeader } from '../../../../components/Group';
import { PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '../../../../components/PageHeader';
import { RecipeDisplay } from '../../../../components/RecipeDisplay/RecipeDisplay';
import { Text } from '../../../../components/Text/Text';
import { IconArea, IconCog, IconConstruction, IconCross, IconFactory, IconPlus } from '../../../../icons';

export const TileBaseProduction: Component = () => {
    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Equipment</PageHeaderTitle>
                <PageHeaderIcon icon={IconFactory} text="3" />
                <PageHeaderIcon icon={IconArea} text="145" />
                <Spacer />
                <PageHeaderActions>
                    <Button square style="light">
                        <IconConstruction size={32} block />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Container direction="column" hasGap padded="h">
                <Group>
                    <GroupHeader>
                        <Text size="h2" color="primary">
                            Drill
                        </Text>

                        <Badge style="transparent" iconLeft={IconFactory}>
                            2
                        </Badge>
                        <Badge style="transparent" iconLeft={IconArea}>
                            120
                        </Badge>

                        <Spacer />

                        <Button square style="light">
                            <IconPlus size={32} block />
                        </Button>
                        <Button square style="light">
                            <IconCog size={32} block />
                        </Button>
                        <Button square style="light">
                            <IconCross size={32} block />
                        </Button>
                    </GroupHeader>

                    <Container hasGap>
                        <RecipeDisplay
                            inputs={[]}
                            outputs={[{ commodityId: 'coal', speed: '+1 t/d', style: 'green' }]}
                            animatedArrow
                            belowArrow={<Text>50%</Text>}
                        />
                        <RecipeDisplay
                            inputs={[]}
                            outputs={[{ commodityId: 'ironOre', speed: '+1 t/d', style: 'green' }]}
                            animatedArrow
                            belowArrow={<Text>50%</Text>}
                        />
                    </Container>
                </Group>

                <Group>
                    <GroupHeader>
                        <Text size="h2" color="primary">
                            Smelter
                        </Text>

                        <Badge style="transparent" iconLeft={IconFactory}>
                            1
                        </Badge>
                        <Badge style="transparent" iconLeft={IconArea}>
                            25
                        </Badge>

                        <Spacer />

                        <Button square style="light">
                            <IconPlus size={32} block />
                        </Button>
                        <Button square style="light">
                            <IconCog size={32} block />
                        </Button>
                        <Button square style="light">
                            <IconCross size={32} block />
                        </Button>
                    </GroupHeader>
                    <Container hasGap>
                        <RecipeDisplay
                            inputs={[
                                { commodityId: 'ironOre', speed: '-1 t/d' },
                                { commodityId: 'oxygen', speed: '-1 t/d' },
                                { commodityId: 'coal', speed: '-1 t/d' },
                            ]}
                            outputs={[{ commodityId: 'steel', speed: '+1 t/d', style: 'green' }]}
                            animatedArrow
                            belowArrow={<Text>100%</Text>}
                        />
                    </Container>
                </Group>
            </Container>
        </>
    );
};
