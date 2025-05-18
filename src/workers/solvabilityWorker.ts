/* SOLVABILITY WORKER DISABLED - Performance optimization needed
 * To re-enable the solvability worker:
 * 1. Uncomment the worker code below
 * 2. Re-enable the worker functionality in Deck.ts
 * 3. Consider adjusting these parameters for better performance:
 *    - MAX_SOLVER_TIME (currently 30s, too slow)
 *    - NO_IMPROVEMENT_LIMIT (currently 5s, too long)
 *    - MAX_STATES_TO_EXPLORE (currently 100k, may need optimization)
 */

// Add empty export to make this a module
export {};

/*
// Original worker code commented out
const MAX_SOLVER_TIME = 30000; // 30 seconds
const MAX_SOLVER_DEPTH = 5000;
const MAX_STATES_TO_EXPLORE = 100000;
const NO_IMPROVEMENT_LIMIT = 5000; // 5 seconds
const PROGRESS_LOG_INTERVAL = 1000; // 1 second

// ... rest of the original worker code ...
*/
