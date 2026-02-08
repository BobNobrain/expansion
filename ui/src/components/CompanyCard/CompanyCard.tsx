import { Show, type Component } from 'solid-js';
import { Badge, Card, Container, SkeletonText, Text } from '@/atoms';
import type { Company } from '@/domain/Company';
import { IconBranchOffice, IconFlag } from '@/icons';
import { CompanyLogo } from '../CompanyLogo/CompanyLogo';
import { GameTimeLabel } from '../GameTimeLabel/GameTimeLabel';
import styles from './CompanyCard.module.css';

export type CompanyCardProps = {
    company: Company | null;
    isLoading?: boolean;
    onClick?: (ev: MouseEvent) => void;
};

export const CompanyCard: Component<CompanyCardProps> = (props) => {
    return (
        <Card onClick={props.onClick}>
            <Container direction="row" hasGap>
                <div class={styles.logoCanvas}>
                    <CompanyLogo
                        companyName={props.company?.name ?? null}
                        value={props.company?.logo ?? null}
                        isLoading={props.isLoading}
                    />
                </div>
                <Container padded size="s">
                    <Text size="large" color="primary">
                        <Show when={!props.company} fallback={props.company!.name}>
                            <SkeletonText length={10} />
                        </Show>
                    </Text>
                    <Text size="small">
                        est. <GameTimeLabel value={props.company?.created ?? null} />
                    </Text>
                    <Container direction="row" wrap>
                        <Badge style="transparent" iconLeft={IconFlag}>
                            3
                        </Badge>
                        <Badge style="transparent" iconLeft={IconBranchOffice}>
                            2
                        </Badge>
                    </Container>
                </Container>
            </Container>
        </Card>
    );
};
