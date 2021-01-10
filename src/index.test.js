import * as index from './index';

describe('index', () => {
  it('should expose compare and serve functions', () => {
    expect(index.compare).toBeInstanceOf(Function);
    expect(index.serve).toBeInstanceOf(Function);
  });
});
