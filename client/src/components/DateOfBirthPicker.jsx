import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

export default function DateOfBirthPicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= 1940; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [month, setMonth] = useState(value || new Date(2000, 0, 1));

  return (
    <div className="relative z-20 font-body">
      <label className="mb-2 block text-sm font-medium text-[#0A5C58]">
        Date of Birth
      </label>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left shadow-sm transition ${
          error
            ? "border-red-400 ring-2 ring-red-50"
            : "border-[#A8CECC] hover:border-[#16AFA2]"
        }`}
      >
        <span className={value ? "text-sm text-[#073E3B]" : "text-sm text-[#7AB8B5]"}>
          {value ? format(value, "dd MMM yyyy") : "Select your date of birth"}
        </span>
        <CalendarDays className="h-5 w-5 text-[#16AFA2]" />
      </button>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#A0E4E1] bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#A8CECC] bg-[#D0F4F2] transition hover:border-[#16AFA2] hover:bg-[#A0E4E1]"
              >
                <ChevronLeft className="h-4 w-4 text-[#16AFA2]" />
              </button>

              <div className="flex gap-2">
                <select
                  value={month.getMonth()}
                  onChange={(e) =>
                    setMonth(new Date(month.getFullYear(), Number(e.target.value), 1))
                  }
                  className="rounded-lg border border-[#A8CECC] bg-[#D0F4F2] px-2 py-2 text-xs text-[#0A5C58] outline-none focus:border-[#16AFA2]"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={month.getFullYear()}
                  onChange={(e) =>
                    setMonth(new Date(Number(e.target.value), month.getMonth(), 1))
                  }
                  className="rounded-lg border border-[#A8CECC] bg-[#D0F4F2] px-2 py-2 text-xs text-[#0A5C58] outline-none focus:border-[#16AFA2]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#A8CECC] bg-[#D0F4F2] transition hover:border-[#16AFA2] hover:bg-[#A0E4E1]"
              >
                <ChevronRight className="h-4 w-4 text-[#16AFA2]" />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                onChange(date);
                if (date) setOpen(false);
              }}
              disabled={{ after: new Date() }}
              showOutsideDays
              className="rdp-custom"
              classNames={{
                months: "flex flex-col",
                month: "space-y-2",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "mb-1 flex justify-between",
                head_cell: "w-10 text-center text-[11px] font-semibold text-[#7AB8B5]",
                row: "mt-1 flex justify-between",
                cell: "h-10 w-10 text-center",
                day: "h-10 w-10 rounded-full text-sm font-medium text-[#073E3B] transition hover:bg-[#D0F4F2] hover:text-[#16AFA2]",
                day_selected:
                  "bg-[#16AFA2] text-white hover:bg-[#0D7A75] hover:text-white",
                day_today: "border border-[#16AFA2] text-[#16AFA2]",
                day_outside: "text-[#A8CECC]",
                day_disabled: "text-[#A8CECC]",
              }}
            />

            <div className="mt-4 flex items-center justify-between border-t border-[#D0F4F2] pt-3">
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="text-sm text-[#4A9B97] transition hover:text-red-500"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#16AFA2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0D7A75]"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
