import { SiteFooter, SiteHeader } from "@/components/site-header";
import { EstimatorForm } from "./estimator-form";

export const instant = false;

export const metadata = {
  title: "Rent estimator | liveAir",
  description: "Estimate a fair monthly rent for any area in Bangladesh before you list or book.",
};

export default function EstimatePage() {
  return (
    <main className="min-h-screen bg-[#faf8f1]">
      <SiteHeader />

      <div className="mx-auto w-[min(1100px,calc(100%-80px))] pb-10 pt-8 max-sm:w-[calc(100%-40px)]">
        <span className="text-[10px] font-bold tracking-[0.15em] text-[#77918a]">
          AI RENT ESTIMATOR
        </span>
        <h1 className="mt-2 font-[Georgia,'Times_New_Roman',serif] text-[clamp(26px,3.2vw,38px)] font-normal leading-tight text-[#153b3c]">
          What should this home cost?
        </h1>
        <p className="mb-6 mt-2 max-w-[620px] text-[13.5px] leading-relaxed text-[#6b7770]">
          Owners use it to price a new listing; renters use it to check whether a listing
          is fairly priced. Estimates learn from areas, size and fittings.
        </p>

        <EstimatorForm />
      </div>

      <SiteFooter />
    </main>
  );
}
