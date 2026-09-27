/* global jest */
jest.mock('@react-native-async-storage/async-storage', () => {
  const createAsyncStorage = () => {
    const data = new Map();
    return {
      getItem: async key => (data.has(key) ? data.get(key) : null),
      setItem: async (key, value) => void data.set(key, value),
      removeItem: async key => void data.delete(key),
    };
  };
  return {
    __esModule: true,
    createAsyncStorage,
    default: createAsyncStorage(),
  };
});

// The Chainway reader only exists on the Android device; every native call resolves true in tests.
// One cached jest.fn per method so tests can assert on calls.
jest.mock('./specs/NativeChainwayRfid', () => {
  const fns = {};
  return {
    __esModule: true,
    default: new Proxy(
      {},
      {
        get: (_, name) =>
          (fns[name] = fns[name] || jest.fn(() => Promise.resolve(true))),
      },
    ),
  };
});

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
