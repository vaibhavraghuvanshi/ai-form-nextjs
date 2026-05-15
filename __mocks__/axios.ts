/**
 * Manual mock for axios.
 * Place at <rootDir>/__mocks__/axios.ts  — Jest auto-resolves this for any
 * `import axios from 'axios'` without needing jest.mock('axios') in tests.
 *
 * Usage in tests:
 *   import axios from 'axios';
 *   (axios.post as jest.Mock).mockResolvedValueOnce({ data: { ok: true } });
 */

const axiosMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
  create: jest.fn().mockReturnThis(),
  defaults: {
    headers: {
      common: {},
      post: {},
      get: {},
    },
    baseURL: "",
    timeout: 0,
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn(),
    },
  },
  isAxiosError: jest.fn(() => false),
};

export default axiosMock;
