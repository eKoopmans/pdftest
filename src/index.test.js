import * as index from './index';

describe('index', () => {
  it('should expose client and server objects', () => {
    expect(index.client).toMatchObject({ compare: expect.any(Function) });
    expect(index.server).toMatchObject({ serve: expect.any(Function) });
  });
});
