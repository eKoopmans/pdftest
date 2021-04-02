import * as index from './index';

describe('index', () => {
  it('should expose methods and api', () => {
    expect(index).toMatchObject({
      compare: expect.any(Function),
      compareToSnapshot: expect.any(Function),
      showDiff: expect.any(Function),
      api: expect.any(Object),
    });
  });
});
