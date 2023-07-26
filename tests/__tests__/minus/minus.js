import { runFile, insp } from '../../helpers/testsHelper';

let pjs = runFile(import.meta.url, 'minus.code');

test('result = 0', () => {
    expect(pjs.engine.results[0]).toBe(0);
});
test('result = -95', () => {
    expect(pjs.engine.results[1]).toBe(-95);
});