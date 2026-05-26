/**
 * Randomization Service for Balanced Scenario Assignment
 * 
 * Uses localStorage-based counter for balanced round-robin assignment.
 * Each respondent is assigned once and their assignment persists across refreshes.
 */

import { Platform } from 'react-native';

// Study 1: Autonomy only (2 conditions)
export type Study1Scenario = 'S1_LOW' | 'S1_HIGH';

// Study 2: Autonomy × Teaming (4 conditions)
export type Study2Scenario = 'S2_HL' | 'S2_HH' | 'S2_LL' | 'S2_LH';

const STUDY1_SCENARIOS: Study1Scenario[] = ['S1_LOW', 'S1_HIGH'];
const STUDY2_SCENARIOS: Study2Scenario[] = ['S2_HL', 'S2_HH', 'S2_LL', 'S2_LH'];

// Storage keys
const STUDY1_ASSIGNMENT_KEY = 'study1_assigned_scenario';
const STUDY1_COUNTER_KEY = 'study1_counter';
const STUDY2_ASSIGNMENT_KEY = 'study2_assigned_scenario';
const STUDY2_COUNTER_KEY = 'study2_counter';

function getStorage(): Storage | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Get the balanced next scenario based on counters.
 * Assigns the scenario with the fewest current assignments.
 * If tied, picks randomly among the tied scenarios.
 */
function getBalancedAssignment<T extends string>(
  scenarios: T[],
  counterKey: string,
  assignmentKey: string
): T {
  const storage = getStorage();

  if (!storage) {
    // Fallback: pure random if no localStorage (e.g. native)
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  // Check if this respondent already has an assignment
  const existingAssignment = storage.getItem(assignmentKey);
  if (existingAssignment && scenarios.includes(existingAssignment as T)) {
    return existingAssignment as T;
  }

  // Get current counters
  let counters: Record<string, number> = {};
  try {
    const stored = storage.getItem(counterKey);
    if (stored) {
      counters = JSON.parse(stored);
    }
  } catch {
    counters = {};
  }

  // Initialize missing counters
  for (const s of scenarios) {
    if (counters[s] === undefined) {
      counters[s] = 0;
    }
  }

  // Find the minimum count
  const minCount = Math.min(...scenarios.map((s) => counters[s]));

  // Get all scenarios with the minimum count
  const candidates = scenarios.filter((s) => counters[s] === minCount);

  // Pick randomly among tied candidates
  const assigned = candidates[Math.floor(Math.random() * candidates.length)];

  // Update counter and save assignment
  counters[assigned] = (counters[assigned] || 0) + 1;
  storage.setItem(counterKey, JSON.stringify(counters));
  storage.setItem(assignmentKey, assigned);

  return assigned;
}

/**
 * Get or assign a Study 1 scenario for this respondent.
 * Returns 'S1_LOW' or 'S1_HIGH' with balanced 50/50 distribution.
 */
export function getStudy1Assignment(): Study1Scenario {
  return getBalancedAssignment(STUDY1_SCENARIOS, STUDY1_COUNTER_KEY, STUDY1_ASSIGNMENT_KEY);
}

/**
 * Get or assign a Study 2 scenario for this respondent.
 * Returns one of 'S2_HL', 'S2_HH', 'S2_LL', 'S2_LH' with balanced 25/25/25/25 distribution.
 */
export function getStudy2Assignment(): Study2Scenario {
  return getBalancedAssignment(STUDY2_SCENARIOS, STUDY2_COUNTER_KEY, STUDY2_ASSIGNMENT_KEY);
}

/**
 * Check if respondent already has a Study 1 assignment.
 */
export function hasStudy1Assignment(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(STUDY1_ASSIGNMENT_KEY) !== null;
}

/**
 * Check if respondent already has a Study 2 assignment.
 */
export function hasStudy2Assignment(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(STUDY2_ASSIGNMENT_KEY) !== null;
}

/**
 * Get current assignment counters for debugging/admin.
 */
export function getStudy1Counters(): Record<string, number> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const stored = storage.getItem(STUDY1_COUNTER_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getStudy2Counters(): Record<string, number> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const stored = storage.getItem(STUDY2_COUNTER_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Reset all assignments (for testing only).
 */
export function resetAllAssignments(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STUDY1_ASSIGNMENT_KEY);
  storage.removeItem(STUDY1_COUNTER_KEY);
  storage.removeItem(STUDY2_ASSIGNMENT_KEY);
  storage.removeItem(STUDY2_COUNTER_KEY);
}
