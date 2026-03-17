import React, { useEffect, useState } from "react";
import { contractAPI, reportAPI } from "../services/api";

const Manager = () => {
  const [contracts, setContracts] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [contractRes, weeklyRes, monthlyRes] = await Promise.all([
          contractAPI.list(),
          reportAPI.weeklyReturns(),
          reportAPI.monthlyReturns(),
        ]);
        setContracts(contractRes.data.contracts || []);
        setWeekly(weeklyRes.data.data || []);
        setMonthly(monthlyRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const totalOutstanding = contracts.reduce(
    (sum, c) => sum + (Number(c.allocated_amount) - Number(c.total_paid || 0)),
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manager Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Total Contracts</p>
          <p className="text-xl font-semibold">{contracts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Outstanding Balance</p>
          <p className="text-xl font-semibold text-orange-600">
            {totalOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Completed Contracts</p>
          <p className="text-xl font-semibold text-green-600">
            {contracts.filter((c) => c.status === "completed").length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">Weekly Returns</h3>
          <ul className="space-y-1 text-xs">
            {weekly.map((w) => (
              <li key={w.week} className="flex justify-between">
                <span>{new Date(w.week).toLocaleDateString()}</span>
                <span className="font-semibold">
                  {Number(w.total_amount).toLocaleString()}
                </span>
              </li>
            ))}
            {weekly.length === 0 && (
              <li className="text-gray-500">No data yet.</li>
            )}
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">Monthly Returns</h3>
          <ul className="space-y-1 text-xs">
            {monthly.map((m) => (
              <li key={m.month} className="flex justify-between">
                <span>
                  {new Date(m.month).toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-semibold">
                  {Number(m.total_amount).toLocaleString()}
                </span>
              </li>
            ))}
            {monthly.length === 0 && (
              <li className="text-gray-500">No data yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">
          Contracts Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Asset</th>
                <th className="px-3 py-2 text-right">Allocated</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-right">Balance</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const balance = Number(c.allocated_amount) - Number(c.total_paid || 0);
                return (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">#{c.id}</td>
                    <td className="px-3 py-2">{c.customer_name || c.customer_id}</td>
                    <td className="px-3 py-2">{c.asset_name || c.asset_id}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(c.allocated_amount).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(c.total_paid || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {balance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{c.status}</td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={7}>
                    No contracts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Manager;
