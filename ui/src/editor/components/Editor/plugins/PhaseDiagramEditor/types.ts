export type PhaseDiagramPoint = {
    T: number;
    P: number;
};

export type PhaseDiagramLine = PhaseDiagramPoint[];

export type TriplePhaseDiagram = {
    type: 'triple';
    triple: PhaseDiagramPoint;
    subl: PhaseDiagramLine;
    melt: PhaseDiagramLine;
    boil: PhaseDiagramLine;
};

export type HePhaseDiagram = {
    type: 'he';
    melt: PhaseDiagramLine;
    boil: PhaseDiagramLine;
};

export type MeltPhaseDiagram = {
    type: 'melt';
    melt: PhaseDiagramLine;
};

export type PhaseDiagramData = TriplePhaseDiagram | HePhaseDiagram | MeltPhaseDiagram;
