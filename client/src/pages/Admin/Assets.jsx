import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { assetAPI } from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  initial_value: "",
  allocated_amount: "",
  profit_margin: "",
  installment_plan: "weekly",
  installment_amount: "",
  duration_periods: "",
};

function numberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const AdminAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => {
      const hay = `${a.name || ""} ${a.category || ""} ${a.description || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [assets, query]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await assetAPI.list();
      setAssets(res.data.assets || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (asset) => {
    setEditing(asset);
    setForm({
      name: asset.name || "",
      description: asset.description || "",
      category: asset.category || "",
      initial_value: asset.initial_value ?? "",
      allocated_amount: asset.allocated_amount ?? "",
      profit_margin: asset.profit_margin ?? "",
      installment_plan: asset.installment_plan || "weekly",
      installment_amount: asset.installment_amount ?? "",
      duration_periods: asset.duration_periods ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        initial_value: numberOrNull(form.initial_value),
        allocated_amount: numberOrNull(form.allocated_amount),
        profit_margin: numberOrNull(form.profit_margin),
        installment_plan: form.installment_plan,
        installment_amount: numberOrNull(form.installment_amount),
        duration_periods: numberOrNull(form.duration_periods),
      };

      if (!payload.name) throw new Error("Name is required");
      if (payload.initial_value === null) throw new Error("Initial value is required");
      if (payload.allocated_amount === null) throw new Error("Allocated amount is required");
      if (!payload.installment_plan) throw new Error("Installment plan is required");
      if (payload.installment_amount === null) throw new Error("Installment amount is required");
      if (payload.duration_periods === null) throw new Error("Duration periods is required");

      if (editing) {
        const res = await assetAPI.update(editing.id, payload);
        setAssets((prev) => prev.map((a) => (a.id === editing.id ? res.data.asset : a)));
        toast.success("Asset updated");
      } else {
        const res = await assetAPI.create(payload);
        setAssets((prev) => [res.data.asset, ...prev]);
        toast.success("Asset created");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save asset");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset) => {
    const ok = window.confirm(`Delete asset "${asset.name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await assetAPI.remove(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      toast.success("Asset deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete asset");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assets</h2>
          <p className="text-sm text-gray-500">
            Create, edit, and remove products used in pay-as-you-go contracts.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            className="flex-1 md:w-72 border rounded-lg px-3 py-2 text-sm bg-white"
          />
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Add Asset
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Initial</th>
              <th className="px-4 py-3 text-right">Allocated</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-right">Installment</th>
              <th className="px-4 py-3 text-right">Periods</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  No assets found.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.category || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(a.initial_value).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {Number(a.allocated_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{a.installment_plan}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(a.installment_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{a.duration_periods}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      className="text-red-600 hover:underline text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                {editing ? "Edit Asset" : "Add Asset"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Initial value
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    value={form.initial_value}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, initial_value: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Allocated payable
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    value={form.allocated_amount}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, allocated_amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Profit margin (%)
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    value={form.profit_margin}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, profit_margin: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Installment plan
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                    value={form.installment_plan}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, installment_plan: e.target.value }))
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Installment amount
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    value={form.installment_amount}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, installment_amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Number of periods
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    min="1"
                    value={form.duration_periods}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, duration_periods: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border text-sm font-semibold"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssets;

