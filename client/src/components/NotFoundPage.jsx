import React, { useMemo } from "react";

const VARIANT_CONTENT = {
  generic: {
    badge: "404 • Not Found",
    title: "This page doesn’t exist",
    description:
      "The page you’re looking for may have moved, been renamed, or may never have existed. Let’s help you get back to something useful.",
  },
  expired: {
    badge: "Link expired",
    title: "This link is no longer available",
    description:
      "This report link has expired. Ask the owner to reshare.",
  },
  deleted: {
    badge: "Report unavailable",
    title: "This report is no longer available",
    description: "This report was deleted.",
  },
};

export default function NotFoundPage({
  variant = "generic",
  brandName = "SNJVNI AI",
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = "Back to dashboard",
  secondaryLabel = "Back to home",
}) {
  const content = useMemo(() => {
    return VARIANT_CONTENT[variant] || VARIANT_CONTENT.generic;
  }, [variant]);

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
      return;
    }

    alert("Navigate to dashboard");
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
      return;
    }

    alert("Navigate to home");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* Left Section */}
          <div className="order-2 lg:order-1">
            <div className="mb-4 inline-flex items-center rounded-full border border-[#16AFA2]/20 bg-[#16AFA2]/10 px-3 py-1 text-sm font-medium text-[#0D7A75]">
              {content.badge}
            </div>

            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {content.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="inline-flex items-center justify-center rounded-2xl bg-[#16AFA2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#16AFA2]/20 transition hover:-translate-y-0.5 hover:bg-[#0D7A75] focus:outline-none focus:ring-4 focus:ring-[#16AFA2]/25"
              >
                {primaryLabel}
              </button>

              <button
                type="button"
                onClick={handleSecondaryClick}
                className="inline-flex items-center justify-center rounded-2xl border border-[#16AFA2]/25 bg-white px-5 py-3 text-sm font-semibold text-[#0D7A75] shadow-sm transition hover:-translate-y-0.5 hover:border-[#16AFA2] hover:bg-[#F3FBFA] focus:outline-none focus:ring-4 focus:ring-[#16AFA2]/20"
              >
                {secondaryLabel}
              </button>
            </div>
          </div>

          {/* Right Section / Illustration */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-xl">
              <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-[#16AFA2]/10 blur-2xl" />
              <div className="absolute -right-4 bottom-10 h-28 w-28 rounded-full bg-[#16AFA2]/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="absolute right-6 top-6 h-3 w-3 rounded-full bg-[#16AFA2]" />
                <div className="absolute right-12 top-10 h-2 w-2 rounded-full bg-[#16AFA2]/50" />
                <div className="absolute left-8 top-16 h-4 w-4 rounded-full bg-[#16AFA2]/15" />

                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                  <div className="relative mb-6 flex h-56 w-full items-center justify-center rounded-[28px] bg-gradient-to-b from-[#F5FCFB] to-white">
                    <div className="absolute bottom-7 h-28 w-28 rounded-[28px] border-4 border-[#16AFA2]/15 bg-white shadow-md" />
                    <div className="absolute bottom-16 right-[26%] h-16 w-16 rounded-2xl bg-[#16AFA2]/12" />
                    <div className="absolute left-[24%] top-10 h-20 w-20 rounded-full bg-[#16AFA2]/10" />
                    <div className="absolute top-12 text-6xl font-black tracking-tight text-[#16AFA2]">
                      404
                    </div>

                    <div className="absolute bottom-12 left-[30%] h-2 w-14 rounded-full bg-slate-200" />
                    <div className="absolute bottom-8 left-[35%] h-2 w-20 rounded-full bg-slate-100" />
                  </div>

                  <div className="rounded-2xl border border-[#16AFA2]/15 bg-[#F8FEFD] px-4 py-3 text-sm text-slate-700">
                    <span className="font-semibold text-[#0D7A75]">{brandName}</span>{" "}
                    couldn’t find this destination, but you’re still in the right
                    place.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
