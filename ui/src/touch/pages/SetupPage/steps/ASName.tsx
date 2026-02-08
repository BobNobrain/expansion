import type { Component } from 'solid-js';
import type { FormFieldState } from '@/atoms/Form/utils';
import { Banner, Button, Container, PageHeader, PageHeaderActions, PageHeaderTitle, TextInput } from '@/atoms';
import { CompanyCard } from '@/components/CompanyCard/CompanyCard';
import { TutorialCareer } from '@/domain/Company';
import { IconDice, IconHandbook } from '@/icons';
import { dfMe } from '@/store/datafront';
import commonStyles from '../SetupPage.module.css';

const careerSpecificOptions: Record<TutorialCareer, string[]> = {
    [TutorialCareer.Chemistry]: [
        "%u's Chemicals %l",
        '%u Chemical %l',
        '%u Refining Services %l',
        'United Refineries of %u %l',
    ],
    [TutorialCareer.Construction]: [
        '%u the Builder',
        '%u Construction %l',
        'Construction Services of %u %l',
        '%u Global Construction %l',
    ],
    [TutorialCareer.Farmer]: [
        '%u Agriculture %l',
        '%u Farms %l',
        '%u Farming',
        '%u Natural',
        '%u Growth %l',
        '%u Fields',
    ],
    [TutorialCareer.Food]: [
        '%u Food Supply %l',
        '%u Supplies %l',
        "%u's Rations %l",
        '%u Provisions',
        "%u's Resup Service %l",
        '%u Rations %l',
    ],
    [TutorialCareer.Machinery]: [
        '%u Machinery %l',
        "%u's Machine Assembly %l",
        '%u Machine Tools %l',
        '%u Assemblers %l',
        '%u Automation',
    ],
    [TutorialCareer.Metals]: [
        '%u Metals %l',
        '%u Smithers %l',
        '%u Smithing & Metalworking %l',
        '%u Metal Works %l',
        "The %u's Bolts & Parts",
    ],
    [TutorialCareer.Resources]: ['%u Resource Extraction Services %l', 'Mines of %u %l', '%u Extractors'],
};
const genericOptions = [
    '%u %l',
    "%u's Factories %l",
    '%u Global %l',
    '%u Wares %l',
    '%u Industrial %l',
    '%u Industries %l',
    '%u General %l',
    'Factories of %u %l',
    '%u Space Business %l',
];

const legals = ['LLC', 'ltd.', 'inc.', 'Group', 'Company', 'Holdings', 'Co', 'gmbh'];

export const ASName: Component<{ nameField: FormFieldState<string>; career: TutorialCareer | null }> = (props) => {
    const field = props.nameField;
    const me = dfMe.use();

    const randomizeName = () => {
        const username = me.value()?.user.username ?? 'unknown';

        let options = genericOptions;
        if (props.career) {
            options = options.concat(careerSpecificOptions[props.career]);
        }

        const template = options[Math.floor(options.length * Math.random())];
        const legal = Math.random() > 0.3 ? legals[Math.floor(Math.random() * legals.length)] : '';

        let generated = template.replace(/%u/g, username).replace(/%l/g, legal).trim();
        const cap = generated[0].toLocaleUpperCase();
        if (generated[0] !== cap) {
            generated = cap + generated.substring(1);
        }

        field.set(generated);
    };

    return (
        <div class={commonStyles.contentPane}>
            <PageHeader>
                <PageHeaderTitle>Company Name</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light">
                        <IconHandbook size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Banner color="info" margin="bottom">
                Company name will be visible to everyone and is expected to be characteristical of your business. It may
                be hard to come up with a proper name at start, so you will have an ability to change it later – but
                there will be cooldown, and naming history of the company will also be public.
                <br />
                If in doubt, take inspiration from some <IconDice size={16} /> randomly generated names.
            </Banner>
            <Container padded background="light" size="s">
                <TextInput
                    value={field.get()}
                    onUpdate={field.set}
                    validity={field.validity()}
                    onBlur={() => field.validate()}
                    label="Name"
                    placeholder="ACME Inc."
                    clearable
                    controls={
                        <Button style="light" size="s" square onClick={randomizeName}>
                            <IconDice size={24} />
                        </Button>
                    }
                />
            </Container>
            <Container padded="v">
                <CompanyCard
                    company={{
                        id: '',
                        created: new Date(),
                        logo: { elements: [] },
                        name: field.get() || '--',
                        ownerId: me.value()?.user.id ?? '',
                    }}
                />
            </Container>
        </div>
    );
};
