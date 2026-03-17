import React, { useEffect, useState } from "react";
import { assetAPI, reportAPI } from "../services/api";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, assetsRes] = await Promise.all([
          reportAPI.adminSummary(),
          assetAPI.list(),
        ]);
        setSummary(summaryRes.data);
        setAssets(assetsRes.data.assets || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Assets</p>
            <p className="text-xl font-semibold">{summary.total_assets}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-xs text-gray-500">Active Contracts</p>
            <p className="text-xl font-semibold">{summary.active_contracts}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Payments</p>
            <p className="text-xl font-semibold">
              {summary.total_payments.toLocaleString()}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-xs text-gray-500">Outstanding Balance</p>
            <p className="text-xl font-semibold text-orange-600">
              {summary.outstanding_balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-2">Assets</h3>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Initial Value</th>
                <th className="px-4 py-2 text-right">Allocated Amount</th>
                <th className="px-4 py-2 text-left">Plan</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t">
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">{asset.category}</td>
                  <td className="px-4 py-2 text-right">
                    {Number(asset.initial_value).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {Number(asset.allocated_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {asset.installment_plan} • {asset.duration_periods} periods
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                    No assets defined yet.
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

export default AdminDashboard;
