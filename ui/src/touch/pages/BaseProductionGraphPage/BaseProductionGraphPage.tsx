import { type Component } from 'solid-js';
import { ProductionGraphView } from '../../../components/ProductionGraphView/ProductionGraphView';
import { TouchContentFixed } from '../../components/TouchContentFixed/TouchContentFixed';

export const BaseProductionGraphPage: Component = () => {
    return (
        <TouchContentFixed>
            <ProductionGraphView />
        </TouchContentFixed>
    );
};
