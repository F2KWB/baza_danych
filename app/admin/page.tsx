"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, RefreshCcw, CheckCircle, Loader2, Lock, LogOut, PlusCircle, Truck, Trash2 } from "lucide-react";

interface Shipment {
  id: number;
  order_number: string;
  driver_name: string;
  status: string;
  current_location: string;
  origin: string;
  destination: string;
  updated_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  const [newOrder, setNewOrder] = useState({ number: "", driver: "", origin: "", destination: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("wantranz_admin_auth");
    if (savedAuth === "true") setIsAuthenticated(true);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchShipments();
  }, [isAuthenticated]);

  const fetchShipments = async () => {
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .order('id', { ascending: false });

    if (error) console.error("Błąd pobierania:", error.message);
    else setShipments(data || []);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Wantranz2026") { 
      setIsAuthenticated(true);
      sessionStorage.setItem("wantranz_admin_auth", "true");
    } else { alert("Błędne hasło!"); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("shipments").insert([
      {
        order_number: newOrder.number.toUpperCase(),
        driver_name: newOrder.driver,
        origin: newOrder.origin,
        destination: newOrder.destination,
        status: "ZAŁADUNEK",
        current_location: newOrder.origin,
        updated_at: new Date().toISOString()
      }
    ]);
    setLoading(false);
    if (error) setMessage("Błąd: " + error.message);
    else {
      setMessage("Nowa przesyłka dodana!");
      setNewOrder({ number: "", driver: "", origin: "", destination: "" });
      fetchShipments();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    const { error } = await supabase
      .from("shipments")
      .update({ status, current_location: location, updated_at: new Date().toISOString() })
      .eq("id", Number(selectedId));
    setLoading(false);
    if (error) setMessage("Błąd: " + error.message);
    else { setMessage("Dane zaktualizowane!"); fetchShipments(); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę przesyłkę?")) return;
    const { error } = await supabase.from("shipments").delete().eq("id", id);
    if (error) alert("Błąd usuwania: " + error.message);
    else fetchShipments();
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center px-6 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-gray-800">
          <div className="inline-flex p-4 bg-red-50 rounded-2xl text-red-600 mb-6"><Lock className="w-8 h-8" /></div>
          <h1 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Panel <span className="text-red-600">Admina</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              name="admin-password"
              title="Hasło dostępowe do panelu" 
              placeholder="Hasło" 
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-600 transition-all text-center font-bold" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              autoFocus 
            />
            <button 
              type="submit" 
              aria-label="Zaloguj się do panelu"
              className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-red-600 transition-all shadow-lg"
            >
              Zaloguj
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* NAGŁÓWEK */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl text-white"><Truck className="w-6 h-6" /></div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Wantranz <span className="text-red-600">Control</span></h1>
          </div>
          <button 
            onClick={() => { sessionStorage.removeItem("wantranz_admin_auth"); window.location.reload(); }} 
            title="Wyloguj się z systemu"
            aria-label="Wyloguj"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Wyloguj
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FORMULARZ: DODAWANIE */}
          <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-2"><PlusCircle className="text-red-600" aria-hidden="true" /> Nowy Ładunek</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Numer (np. WT-1005)" title="Numer zamówienia" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={newOrder.number} onChange={e => setNewOrder({...newOrder, number: e.target.value})} required />
              <input type="text" placeholder="Kierowca" title="Imię i nazwisko kierowcy" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={newOrder.driver} onChange={e => setNewOrder({...newOrder, driver: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Z" title="Miejsce załadunku" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={newOrder.origin} onChange={e => setNewOrder({...newOrder, origin: e.target.value})} required />
                <input type="text" placeholder="Do" title="Miejsce docelowe" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={newOrder.destination} onChange={e => setNewOrder({...newOrder, destination: e.target.value})} required />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                aria-label="Utwórz nową przesyłkę"
                className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-red-600 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
              >
                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle className="w-5 h-5" />} Utwórz
              </button>
            </form>
          </section>

          {/* FORMULARZ: EDYCJA */}
          <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-2"><RefreshCcw className="text-red-600" aria-hidden="true" /> Aktualizacja</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="select-shipment" className="text-[10px] font-black uppercase text-gray-400 ml-2">Wybierz ładunek</label>
                <select id="select-shipment" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={selectedId} onChange={(e) => {
                  const s = shipments.find(item => item.id === Number(e.target.value));
                  setSelectedId(e.target.value); setStatus(s?.status || ""); setLocation(s?.current_location || "");
                }}>
                  <option value="">-- Wybierz z listy --</option>
                  {shipments.map(s => <option key={s.id} value={s.id}>{s.order_number} ({s.driver_name})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="select-status" className="text-[10px] font-black uppercase text-gray-400 ml-2">Status</label>
                <select id="select-status" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ZAŁADUNEK">ZAŁADUNEK</option>
                  <option value="W TRASIE">W TRASIE</option>
                  <option value="OPÓŹNIENIE">OPÓŹNIENIE</option>
                  <option value="DOSTARCZONO">DOSTARCZONO</option>
                </select>
              </div>
              <input type="text" placeholder="Lokalizacja GPS" title="Aktualna lokalizacja" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600" value={location} onChange={e => setLocation(e.target.value)} />
              <button 
                type="submit" 
                disabled={loading || !selectedId} 
                aria-label="Zapisz zmiany w przesyłce"
                className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase italic hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />} Zapisz
              </button>
            </form>
          </section>
        </div>

        {/* LISTA PRZESYŁEK */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50">
             <h2 className="text-xl font-black uppercase italic">Aktywne Zlecenia</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="p-6">Nr zamówienia</th>
                  <th className="p-6">Kierowca</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shipments.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6 font-black text-gray-900">{s.order_number}</td>
                    <td className="p-6 font-bold text-gray-500 uppercase text-xs italic">{s.driver_name}</td>
                    <td className="p-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full ${s.status === 'DOSTARCZONO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{s.status}</span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        aria-label={`Usuń przesyłkę ${s.order_number}`}
                        title="Usuń przesyłkę"
                        className="text-gray-300 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {message && (
          <div className={`fixed bottom-8 right-8 p-6 rounded-3xl shadow-2xl font-black uppercase italic text-xs animate-in slide-in-from-right duration-500 ${message.includes("Błąd") ? "bg-red-600 text-white" : "bg-black text-white"}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}