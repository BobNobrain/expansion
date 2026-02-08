export type Company = {
    id: string;
    ownerId: string;
    name: string;
    created: Date;
    logo: CompanyLogo;
};

export type CompanyLogo = {
    elements: CompanyLogoElement[];
};

type CompanyLogoElementBase = {
    x: number;
    y: number;
    c: string;
};

export type CompanyLogoElement = CompanyLogoElementBase &
    (
        | { type: 'ellipse'; rx: number; ry: number }
        | { type: 'rect'; rx: number; ry: number }
        | { type: 'text'; text: string }
    );

export enum TutorialCareer {
    Farmer = 'farming',
    Food = 'food',
    Resources = 'resources',
    Metals = 'metals',
    Construction = 'construction',
    Machinery = 'machinery',
    Chemistry = 'chemistry',
}
