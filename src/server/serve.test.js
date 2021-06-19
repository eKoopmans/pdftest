import serve from './serve'
import fetch from 'cross-fetch'
import fs from 'fs'
import path from 'path'

describe('serve', () => {
  let server;
  beforeEach(() => {
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });
  afterEach(() => {
    server && server.close();
    server = null;
    jest.restoreAllMocks();
  });

  const standardPostPut = (filepath, method, body) => fetch(`http://localhost:8000/${filepath}`, {
    method,
    body,
    headers: { 'Content-Type': 'application/octet-stream' },
  });

  describe('setup', () => {
    it('should serve cwd on port 8000 by default', async () => {
      server = await serve();
      const response = await fetch('http://localhost:8000/package.json');
      expect(response.ok).toBeTruthy();
    });
  
    it('should have configurable port and root directory', async () => {
      server = await serve(7000, './src/server');
      const response = await fetch('http://localhost:7000/serve.test.js');
      expect(response.ok).toBeTruthy();
    });
  
    it('should send 200 on the root URL for the API handshake', async () => {
      server = await serve();
      const response = await fetch('http://localhost:8000');
      expect(response.status).toBe(200);
    });
  });

  describe('PUT', () => {
    const data = Buffer.from('test data');

    it('should write a file even if it already exists', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      server = await serve();
      await standardPostPut('some/directory/test.pdf', 'PUT', data);

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join('some/directory'), expect.anything());
      expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('some/directory/test.pdf'), data);
    });

    it('should always return file contents', async () => {
      server = await serve();
      const response = await standardPostPut('some/directory/test.pdf', 'PUT', data);

      // 404 here because the file was not actually created (it was mocked), so it can't be read.
      expect(response.status).toBe(404);
    });
  });

  describe('POST', () => {
    const data = Buffer.from('test data');

    it('should write a file if it does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      server = await serve();
      await standardPostPut('some/directory/test.pdf', 'POST', data);

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join('some/directory'), expect.anything());
      expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('some/directory/test.pdf'), data);
    });

    it('should not write if the file exists', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      server = await serve();
      await standardPostPut('some/directory/test.pdf', 'POST', data);

      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should always return file contents', async () => {
      server = await serve();
      const response = await standardPostPut('some/directory/test.pdf', 'POST', data);

      // 404 here because the file was not actually created (it was mocked), so it can't be read.
      expect(response.status).toBe(404);
    });
  });

  describe('file size limit', () => {
    it('should allow POST/PUT data under the limit', async () => {
      server = await serve(undefined, undefined, { limit: '12b' });
      const res = await standardPostPut('some/directory/test.pdf', 'PUT', '< 12 bytes');
      expect(res.status).toBe(404);
    });

    it('should fail when POST/PUT data is larger than the limit', async () => {
      server = await serve(undefined, undefined, { limit: '12b' });
      const res = await standardPostPut('some/directory/test.pdf', 'PUT', '> 12 bytes: error');
      expect(res.status).toBe(413);
      expect(res.statusText).toBe('Payload Too Large');
    });
  });
});
