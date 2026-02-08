import { createSignal, type Component } from 'solid-js';
import { CompanyLogo } from '@/components/CompanyLogo/CompanyLogo';
import { LogoEditor, type LogoEditorController } from '@/components/LogoEditor';
import commonStyles from '../SetupPage.module.css';
import type { createState } from '../state';

export const ASLogo: Component<{
    name: string;
    logoField: ReturnType<typeof createState>['logo'];
}> = (props) => {
    const field = props.logoField;
    const [showRulers, setShowRulers] = createSignal(false);

    let logoEditorController: LogoEditorController | null = null;

    return (
        <div class={commonStyles.contentPane} onClick={() => logoEditorController?.resetSelection()}>
            <CompanyLogo companyName={props.name} value={field.result()} height="300px" showRulers={showRulers()} />
            <LogoEditor
                elements={field.state.elements}
                onAppend={(el) => field.update('elements', (els) => [...els, el])}
                onRemove={(idx) =>
                    field.update('elements', (els) => {
                        const copy = els.slice();
                        copy.splice(idx, 1);
                        return copy;
                    })
                }
                onReplaceAll={(els) => field.update('elements', els)}
                onUpdate={(idx, patch) => field.update('elements', idx, patch)}
                onSwap={(i1, i2) => {
                    field.update('elements', (els) => {
                        const copy = els.slice();
                        const e1 = copy[i1];
                        const e2 = copy[i2];
                        copy[i1] = e2;
                        copy[i2] = e1;
                        return copy;
                    });
                }}
                showRulers={showRulers()}
                onToggleRulers={() => setShowRulers((x) => !x)}
                companyName={props.name}
                title="Logo"
                controllerRef={(c) => {
                    logoEditorController = c;
                }}
            />
        </div>
    );
};
