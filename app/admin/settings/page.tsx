"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";

interface Setting { key: string; value: string; group: string }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch {} finally { setLoading(false); }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s));
  };

  const saveSettings = async () => {
    setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: settings.map((s) => ({ key: s.key, value: s.value })) }) });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Settings saved successfully.");
    } catch { setMessage("Failed to save settings."); } finally { setSaving(false); }
  };

  const groups = [...new Set(settings.map((s) => s.group))];

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Settings</h1><p className="text-xs text-slate-500 mt-1">Configure site-wide settings</p></div>
        <button onClick={saveSettings} disabled={saving} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 disabled:opacity-50"><Save className="w-3.5 h-3.5" /><span>{saving ? "Saving..." : "Save All"}</span></button>
      </div>
      {message && <div className={`p-3 rounded-lg text-xs ${message.includes("success") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{message}</div>}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200"><h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{group}</h2></div>
            <div className="p-5 space-y-4">
              {settings.filter((s) => s.group === group).map((s) => (
                <div key={s.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 w-48 shrink-0">{s.key.replace(/_/g, " ")}</label>
                  {s.value === "true" || s.value === "false" ? (
                    <button onClick={() => updateSetting(s.key, s.value === "true" ? "false" : "true")} className={`px-3 py-1.5 rounded text-[11px] font-bold transition ${s.value === "true" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{s.value === "true" ? "Enabled" : "Disabled"}</button>
                  ) : (
                    <input value={s.value} onChange={(e) => updateSetting(s.key, e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
