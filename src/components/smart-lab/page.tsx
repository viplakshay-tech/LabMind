import SmartLab3D from "@/components/smart-lab/SmartLab3D";

export default function SmartLabPage() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            VIRTUAL SMART LAB · DIGITAL TWIN
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Virtual Smart Lab
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Explore a real-time 3D digital twin of a laboratory circuit.
            Change inputs and observe the corresponding circuit outputs
            without physical hardware.
          </p>
        </div>

        <SmartLab3D />
      </div>
    </section>
  );
}