import RoiCalculator from "@/components/roi/RoiCalculator";

export default function RoiCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto h-full">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-hp-text-primary tracking-widest shrink-0 uppercase">
          ROI CALCULATOR
        </h1>
        <p className="font-mono text-sm tracking-widest text-hp-text-muted mt-1 uppercase">
          Simulate performance and optimize hash allocation
        </p>
      </div>
      <RoiCalculator />
    </div>
  );
}
