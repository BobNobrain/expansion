import type { Component } from 'solid-js';
import { type ProductionGraphEdge, type ProductionGraphNode, type ProductionGraph } from '../../domain/Base';
import { Viewport } from '../Viewport/Viewport';
import styles from './ProductionGraphView.module.css';

export type ProductionGraphViewProps = {
    graph?: ProductionGraph;
    onNodeUpdate?: (nodeId: number, update: Partial<ProductionGraphNode>) => void;
    onEdgeUpdate?: (edgeId: number, update: Partial<ProductionGraphEdge>) => void;
};

export const ProductionGraphView: Component<ProductionGraphViewProps> = (props) => {
    return (
        <Viewport fillsAllSpace scaleable>
            <div class={styles.wrapper}>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
            </div>
        </Viewport>
    );
};
