// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the worker
jest.mock('./workers/solvabilityWorker', () => ({
  default: () => ({
    postMessage: jest.fn(),
    onmessage: null,
    terminate: jest.fn()
  })
}));
