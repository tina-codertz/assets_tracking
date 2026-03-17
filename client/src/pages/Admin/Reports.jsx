import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { reportAPI } from "../services/api";

function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState(null);
  const [from, setFrom] = useState(() => isoDate(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [to, setTo] = useState(() => isoDate(Date.now()));

  const rangeLabel = useMemo(() => `${from} → ${to}`, [from, to]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.pnl({ from, to });
      setPnl(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load P&L");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-sm text-gray-500">Profit & Loss, returns, and portfolio health.</p>
        </div>
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">P&L Summary</h3>
          <span className="text-xs text-gray-500">{rangeLabel}</span>
        </div>

        {loading ? (
          <div className="py-6 text-sm text-gray-600">Loading...</div>
        ) : !pnl ? (
          <div className="py-6 text-sm text-gray-600">No data.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Revenue (Payments)</p>
              <p className="text-xl font-semibold">
                {Number(pnl.revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">COGS (Allocated Assets)</p>
              <p className="text-xl font-semibold">
                {Number(pnl.cogs || 0).toLocaleString()}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Gross Profit</p>
              <p className="text-xl font-semibold text-green-700">
                {Number(pnl.gross_profit || 0).toLocaleString()}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Outstanding Balance</p>
              <p className="text-xl font-semibold text-orange-600">
                {Number(pnl.outstanding_balance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReports;

