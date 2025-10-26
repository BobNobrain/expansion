import { type Component } from 'solid-js';
import { ProductionGraphView } from '@/components/ProductionGraphView/ProductionGraphView';
import { TouchContentFixed } from '@/touch/components/TouchContentFixed/TouchContentFixed';

export const BaseProductionGraphPage: Component = () => {
    return (
        <TouchContentFixed>
            <ProductionGraphView />
        </TouchContentFixed>
    );
};
