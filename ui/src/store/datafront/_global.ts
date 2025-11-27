import * as datafront from './all';

// @ts-expect-error For debugging purposes
window.DF = datafront;

const globalCheat = datafront.dfRunCheat.use(() => Date.now().toString());
// @ts-expect-error For debugging purposes
window.cheat = (cmd: string) => {
    globalCheat.run({ cmd }, { onSuccess: () => console.log(globalCheat.result()) });
};
