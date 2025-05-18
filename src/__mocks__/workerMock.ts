// Mock Worker for testing
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor() {
    // Mock constructor
  }

  postMessage(message: any) {
    // Simulate async behavior
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: { success: true } } as MessageEvent);
      }
    }, 0);
  }

  terminate() {
    // Mock terminate
  }
}

// Export both as a class and as a default export to handle different import styles
export { MockWorker };
export default MockWorker; 