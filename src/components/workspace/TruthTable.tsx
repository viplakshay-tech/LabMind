"use client";

import { cn } from "@/lib/utils";
import {
  buildLiveTruthTableRows,
  isWorkspaceExperimentId,
  rowMatchesCurrentInputs,
} from "@/lib/circuitSimulation";
import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";

export default function TruthTable() {
  const { experiment, inputs, inputNames, outputNames } =
    useCircuitWorkspace();

  if (!experiment || !isWorkspaceExperimentId(experiment.id)) {
    return null;
  }

  const rows = buildLiveTruthTableRows(experiment.id, inputs);
  const columns = [...inputNames, ...outputNames];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/30">
      <table className="w-full text-left">
        <thead className="bg-surface-low">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="lab-mono px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const highlighted = rowMatchesCurrentInputs(
              row.inputs,
              inputs,
              inputNames,
            );

            return (
              <tr
                key={row.id}
                className={cn(
                  "border-t border-slate-700/20 transition",
                  highlighted &&
                    "bg-primary/10 ring-1 ring-inset ring-primary/25",
                )}
              >
                {inputNames.map((input) => (
                  <td
                    key={input}
                    className={cn(
                      "lab-mono px-3 py-3 text-xs",
                      highlighted ? "text-white" : "text-slate-300",
                    )}
                  >
                    {row.inputs[input]}
                  </td>
                ))}

                {outputNames.map((output) => (
                  <td
                    key={output}
                    className={cn(
                      "lab-mono px-3 py-3 text-xs",
                      highlighted ? "text-primary" : "text-primary/80",
                    )}
                  >
                    {row.expectedOutputs[output]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
