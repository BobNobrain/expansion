import { type Company } from '../../domain/Company';
import { createDatafrontTable } from '../../lib/datafront/table';
import {
    CompaniesQueryTypeByOwner,
    type CompaniesQueryByOwner,
    type CompaniesTableRow,
} from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater, cleaner } from './misc';

export const dfCompanies = createDatafrontTable<CompaniesTableRow, Company>({
    name: 'companies',
    ws,
    updater,
    cleaner,
    map: (data) => {
        const result: Company = {
            id: data.id,
            created: new Date(data.est),
            name: data.name,
            ownerId: data.owner,
            logo: {},
        };

        return result;
    },
});

export const dfCompaniesByOwnerId = dfCompanies.createQuery<CompaniesQueryByOwner>(
    'companies/' + CompaniesQueryTypeByOwner,
    (p) => p.ownerId,
);
