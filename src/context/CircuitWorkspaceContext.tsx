"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  computeExpectedOutputs,
  computeObservedOutputs,
  defaultInputsForExperiment,
  isWorkspaceExperimentId,
  outputsMatch,
} from "@/lib/circuitSimulation";
import type { Experiment } from "@/types/experiment";
import type {
  ActiveFault,
  CircuitWorkspaceAction,
  CircuitWorkspaceSnapshot,
  CircuitWorkspaceState,
} from "@/types/circuitWorkspace";
import { TROUBLESHOOTER_STATE_KEY } from "@/types/circuitWorkspace";

function recompute(
  experiment: Experiment | null,
  inputs: Record<string, number>,
  faults: ActiveFault[],
): Pick<
  CircuitWorkspaceState,
  "expectedOutputs" | "observedOutputs"
> {
  if (!experiment || !isWorkspaceExperimentId(experiment.id)) {
    return { expectedOutputs: {}, observedOutputs: {} };
  }

  const expectedOutputs = computeExpectedOutputs(experiment.id, inputs);
  const observedOutputs = computeObservedOutputs(
    experiment.id,
    inputs,
    faults,
  );

  return { expectedOutputs, observedOutputs };
}

function createInitialState(): CircuitWorkspaceState {
  return {
    experiment: null,
    inputs: {},
    expectedOutputs: {},
    observedOutputs: {},
    faults: [],
  };
}

function circuitWorkspaceReducer(
  state: CircuitWorkspaceState,
  action: CircuitWorkspaceAction,
): CircuitWorkspaceState {
  switch (action.type) {
    case "INIT": {
      const inputs = action.inputs;
      const faults: ActiveFault[] = [];
      return {
        experiment: action.experiment,
        inputs,
        faults,
        ...recompute(action.experiment, inputs, faults),
      };
    }
    case "SET_INPUT": {
      const inputs = {
        ...state.inputs,
        [action.name]: action.value === 1 ? 1 : 0,
      };
      return {
        ...state,
        inputs,
        ...recompute(state.experiment, inputs, state.faults),
      };
    }
    case "TOGGLE_FAULT": {
      const exists = state.faults.some(
        (f) => f.id === action.fault.id,
      );
      const faults = exists
        ? state.faults.filter((f) => f.id !== action.fault.id)
        : [...state.faults, action.fault];
      return {
        ...state,
        faults,
        ...recompute(state.experiment, state.inputs, faults),
      };
    }
    case "CLEAR_FAULTS":
      return {
        ...state,
        faults: [],
        ...recompute(state.experiment, state.inputs, []),
      };
    case "RESET": {
      if (!state.experiment || !isWorkspaceExperimentId(state.experiment.id)) {
        return state;
      }
      const inputs = defaultInputsForExperiment(state.experiment.id);
      const faults: ActiveFault[] = [];
      return {
        ...state,
        inputs,
        faults,
        ...recompute(state.experiment, inputs, faults),
      };
    }
    default:
      return state;
  }
}

interface CircuitWorkspaceContextValue extends CircuitWorkspaceState {
  setInput: (name: string, value: number) => void;
  toggleFault: (fault: ActiveFault) => void;
  reset: () => void;
  allOutputsPass: boolean;
  outputNames: string[];
  inputNames: string[];
  saveTroubleshooterSnapshot: () => void;
}

const CircuitWorkspaceContext =
  createContext<CircuitWorkspaceContextValue | null>(null);

interface CircuitWorkspaceProviderProps {
  experiment: Experiment;
  children: ReactNode;
}

export function CircuitWorkspaceProvider({
  experiment,
  children,
}: CircuitWorkspaceProviderProps) {
  const [state, dispatch] = useReducer(circuitWorkspaceReducer, undefined, () => {
    const base = createInitialState();
    if (!isWorkspaceExperimentId(experiment.id)) {
      return { ...base, experiment };
    }
    const inputs = defaultInputsForExperiment(experiment.id);
    return {
      experiment,
      inputs,
      faults: [],
      ...recompute(experiment, inputs, []),
    };
  });

  const inputNames = experiment.truthTableSpec.inputs;
  const outputNames = experiment.truthTableSpec.outputs;

  const setInput = useCallback((name: string, value: number) => {
    dispatch({ type: "SET_INPUT", name, value });
  }, []);

  const toggleFault = useCallback((fault: ActiveFault) => {
    dispatch({ type: "TOGGLE_FAULT", fault });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const allOutputsPass = useMemo(
    () =>
      outputsMatch(
        state.expectedOutputs,
        state.observedOutputs,
        outputNames,
      ),
    [state.expectedOutputs, state.observedOutputs, outputNames],
  );

  const saveTroubleshooterSnapshot = useCallback(() => {
    if (!state.experiment) return;

    const snapshot: CircuitWorkspaceSnapshot = {
      experimentId: state.experiment.id,
      inputs: state.inputs,
      expectedOutputs: state.expectedOutputs,
      observedOutputs: state.observedOutputs,
      faults: state.faults,
      timestamp: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(
        TROUBLESHOOTER_STATE_KEY,
        JSON.stringify(snapshot),
      );
    } catch {
      /* sessionStorage unavailable */
    }
  }, [state]);

  const value = useMemo(
    (): CircuitWorkspaceContextValue => ({
      ...state,
      setInput,
      toggleFault,
      reset,
      allOutputsPass,
      outputNames,
      inputNames,
      saveTroubleshooterSnapshot,
    }),
    [
      state,
      setInput,
      toggleFault,
      reset,
      allOutputsPass,
      outputNames,
      inputNames,
      saveTroubleshooterSnapshot,
    ],
  );

  return (
    <CircuitWorkspaceContext.Provider value={value}>
      {children}
    </CircuitWorkspaceContext.Provider>
  );
}

export function useCircuitWorkspace(): CircuitWorkspaceContextValue {
  const ctx = useContext(CircuitWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useCircuitWorkspace must be used within CircuitWorkspaceProvider",
    );
  }
  return ctx;
}
