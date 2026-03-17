import React, { useEffect, useState } from "react";
import { assetAPI, customerAPI, contractAPI, paymentAPI } from "../services/api";

const Agents = () => {
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

  const [newContract, setNewContract] = useState({
    customer_id: "",
    asset_id: "",
  });

  const [payment, setPayment] = useState({
    contract_id: "",
    amount: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [custRes, assetRes, contractRes] = await Promise.all([
          customerAPI.list(),
          assetAPI.list(),
          contractAPI.list(),
        ]);
        setCustomers(custRes.data.customers || []);
        setAssets(assetRes.data.assets || []);
        setContracts(contractRes.data.contracts || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await customerAPI.create(newCustomer);
      setCustomers((prev) => [res.data.customer, ...prev]);
      setNewCustomer({ full_name: "", phone: "", email: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    const asset = assets.find((a) => String(a.id) === String(newContract.asset_id));
    if (!asset) return;

    try {
      const payload = {
        customer_id: Number(newContract.customer_id),
        asset_id: Number(newContract.asset_id),
        allocated_amount: asset.allocated_amount,
        installment_plan: asset.installment_plan,
        installment_amount: asset.installment_amount,
        duration_periods: asset.duration_periods,
      };
      const res = await contractAPI.create(payload);
      setContracts((prev) => [res.data.contract, ...prev]);
      setNewContract({ customer_id: "", asset_id: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        contract_id: Number(payment.contract_id),
        amount: Number(payment.amount),
      };
      const res = await paymentAPI.create(payload);

      setContracts((prev) =>
        prev.map((c) => (c.id === res.data.contract.id ? res.data.contract : c))
      );

      setPayment({ contract_id: "", amount: "" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Agent Workspace</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white p-4 rounded-lg shadow space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Register Customer</h3>
          <form className="space-y-2" onSubmit={handleCreateCustomer}>
            <input
              className="w-full border px-3 py-1 rounded text-sm"
              placeholder="Full name"
              value={newCustomer.full_name}
              onChange={(e) =>
                setNewCustomer((s) => ({ ...s, full_name: e.target.value }))
              }
              required
            />
            <input
              className="w-full border px-3 py-1 rounded text-sm"
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))}
              required
            />
            <input
              className="w-full border px-3 py-1 rounded text-sm"
              placeholder="Email (optional)"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer((s) => ({ ...s, email: e.target.value }))}
            />
            <button className="w-full bg-blue-600 text-white text-sm py-1.5 rounded">
              Save Customer
            </button>
          </form>
        </section>

        <section className="bg-white p-4 rounded-lg shadow space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Assign Asset</h3>
          <form className="space-y-2" onSubmit={handleCreateContract}>
            <select
              className="w-full border px-3 py-1 rounded text-sm"
              value={newContract.customer_id}
              onChange={(e) =>
                setNewContract((s) => ({ ...s, customer_id: e.target.value }))
              }
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
            <select
              className="w-full border px-3 py-1 rounded text-sm"
              value={newContract.asset_id}
              onChange={(e) =>
                setNewContract((s) => ({ ...s, asset_id: e.target.value }))
              }
              required
            >
              <option value="">Select asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} • {a.installment_plan} / {a.installment_amount}
                </option>
              ))}
            </select>
            <button className="w-full bg-green-600 text-white text-sm py-1.5 rounded">
              Create Contract
            </button>
          </form>
        </section>

        <section className="bg-white p-4 rounded-lg shadow space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Record Payment</h3>
          <form className="space-y-2" onSubmit={handleRecordPayment}>
            <select
              className="w-full border px-3 py-1 rounded text-sm"
              value={payment.contract_id}
              onChange={(e) =>
                setPayment((s) => ({ ...s, contract_id: e.target.value }))
              }
              required
            >
              <option value="">Select contract</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} • Customer {c.customer_id}
                </option>
              ))}
            </select>
            <input
              className="w-full border px-3 py-1 rounded text-sm"
              placeholder="Amount"
              value={payment.amount}
              type="number"
              min="0"
              onChange={(e) => setPayment((s) => ({ ...s, amount: e.target.value }))}
              required
            />
            <button className="w-full bg-indigo-600 text-white text-sm py-1.5 rounded">
              Save Payment
            </button>
          </form>
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Active Contracts</h3>
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
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
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

export default Agents;
