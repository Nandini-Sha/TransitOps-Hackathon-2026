import { useEffect, useState, useMemo } from "react";
import { getFuelLogs, type FuelLog } from "../../lib/fuel";
import { getExpenses, type Expense } from "../../lib/expenses";
import AddFuelLogModal from "./AddFuelLogModal";
import AddExpenseModal from "./AddExpenseModal";
import { getOperationalCostReport, type OperationalCostReport } from "../../lib/reports";

export default function FuelAndExpenses() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCostReport[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  function fetchData() {
    setLoading(true);
    Promise.all([getFuelLogs(), getExpenses(), getOperationalCostReport()])
      .then(([f, e, oc]) => {
        setFuelLogs(f);
        setExpenses(e);
        setOperationalCosts(oc);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const totalOperationalCost = useMemo(() => {
    return operationalCosts.reduce((acc, curr) => acc + curr.totalOperationalCost, 0);
  }, [operationalCosts]);

  return (
    <div className="space-y-8">
      {/* FUEL LOGS SECTION */}
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
            Fuel Logs
          </h2>
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(true)}
            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            + Log Fuel
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 font-semibold text-[10px]">VEHICLE</th>
                <th className="py-3 font-semibold text-[10px]">DATE</th>
                <th className="py-3 font-semibold text-[10px]">LITERS</th>
                <th className="py-3 font-semibold text-[10px]">FUEL COST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {fuelLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">{log.vehicle?.regNumber || log.vehicleId}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">
                    {new Date(log.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4">{log.liters.toLocaleString()} L</td>
                  <td className="py-4">{log.cost.toLocaleString()}</td>
                </tr>
              ))}
              {!loading && fuelLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No fuel logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* OTHER EXPENSES SECTION */}
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
            Other Expenses (Toll / Misc)
          </h2>
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            + Add Expense
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 font-semibold text-[10px]">TRIP</th>
                <th className="py-3 font-semibold text-[10px]">VEHICLE</th>
                <th className="py-3 font-semibold text-[10px]">CATEGORY</th>
                <th className="py-3 font-semibold text-[10px]">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {expenses.map((expense) => (
                <tr key={expense.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">{expense.trip?.tripCode || expense.tripId || "N/A"}</td>
                  <td className="py-4 font-medium">{expense.vehicle?.regNumber || expense.vehicleId}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">{expense.category}</td>
                  <td className="py-4">{expense.amount.toLocaleString()}</td>
                </tr>
              ))}
              {!loading && expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="border-t border-white/20 pt-4 pb-8 flex items-center justify-between font-bold text-amber-500 dark:text-amber-400">
        <span className="uppercase text-sm">Total Operational Cost (Auto) = Fuel + Maint + Misc</span>
        <span className="text-xl">{totalOperationalCost.toLocaleString()}</span>
      </div>

      <AddFuelLogModal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} onSuccess={fetchData} />
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}
