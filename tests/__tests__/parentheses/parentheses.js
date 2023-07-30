import { runFile, insp } from '../../helpers/testsHelper';

let pjs = runFile(import.meta.url, 'parentheses.code');

test('result = 14736', () => {
    expect(pjs.engine.results[0]).toBe(14736);
});
test('result = 0', () => {
    expect(pjs.engine.results[1]).toBe(0);
});