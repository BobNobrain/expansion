import { createMemo, type Component } from 'solid-js';
import { Container, DefinitionList, PageHeader, PageHeaderTitle, type DefinitionListItem } from '@/atoms';
import { CompanyCard } from '@/components/CompanyCard/CompanyCard';
import type { Company, CompanyLogo, TutorialCareer } from '@/domain/Company';
import { dfMe } from '@/store/datafront';
import commonStyles from '../SetupPage.module.css';
import { getCareerName } from './ASCareer';

type FinalInfo = {
    career: TutorialCareer | null;
    location: string | null;
};

const DEFS: DefinitionListItem<FinalInfo>[] = [
    {
        title: 'Tutorial Career',
        render: (info) => (info.career ? getCareerName(info.career) : '--'),
    },
    {
        title: 'Location',
        render: (info) => info.location ?? '--',
    },
];

export const ASFinal: Component<{
    name: string;
    logo: CompanyLogo;
    career: TutorialCareer | null;
    location: string | null;
}> = (props) => {
    const me = dfMe.use();

    const company = createMemo((): Company => {
        return {
            id: '',
            created: new Date(),
            logo: props.logo,
            name: props.name || '--',
            ownerId: me.value()?.user.id ?? '',
        };
    });

    return (
        <div class={commonStyles.contentPane}>
            <PageHeader>
                <PageHeaderTitle>Your New Company</PageHeaderTitle>
            </PageHeader>
            <Container padded>
                <CompanyCard company={company()} />
            </Container>
            <DefinitionList inset items={DEFS} value={{ career: props.career, location: props.location }} />
        </div>
    );
};
