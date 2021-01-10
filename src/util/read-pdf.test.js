import { getPdfObjects, getPageImages } from './read-pdf';

describe('read-pdf', () => {
  it('should expose getPdfObjects and getPageImages functions', () => {
    expect(getPdfObjects).toBeInstanceOf(Function);
    expect(getPageImages).toBeInstanceOf(Function);
  });
});
