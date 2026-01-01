"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Truck,
  MapPin,
  Package,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("shipments")
        .select("*")
        .eq("order_number", searchQuery.toUpperCase())
        .single();

      if (supabaseError) {
        setError("Nie znaleziono przesyłki.");
      } else {
        console.log("DANE Z SUPABASE:", data);
        setShipment(data);
      }
    } catch (err) {
      setError("Problem z połączeniem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* NAGŁÓWEK */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
            Śledzenie <span className="text-red-600">Wantranz</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">
            Monitorowanie ładunku w czasie rzeczywistym
          </p>
        </div>

        {/* WYSZUKIWARKA */}
        <form onSubmit={handleTrack} className="relative mb-12">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz numer zamówienia (np. WT-1001)"
              className="w-full bg-white border-2 border-gray-100 p-6 pr-40 rounded-3xl shadow-2xl outline-none focus:border-red-600 transition-all font-black italic text-xl uppercase placeholder:text-gray-300 placeholder:not-italic"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 bg-red-600 text-white px-8 rounded-2xl font-black uppercase italic hover:bg-black transition-all flex items-center gap-2 disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "Szukam..." : "Szukaj"}
            </button>
          </div>
        </form>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-6 rounded-3xl text-red-600 mb-12 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="shrink-0" />
            <p className="font-bold text-sm italic">{error}</p>
          </div>
        )}

        {/* WYNIK ŚLEDZENIA */}
        {shipment && (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${
                    shipment.status === 'DOSTARCZONO' ? 'bg-green-50 text-green-600 border-green-100' :
                    shipment.status === 'W TRASIE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    ● {shipment.status}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic mt-6 text-gray-900 tracking-tighter">
                    {shipment.order_number}
                  </h2>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ostatnia aktualizacja</p>
                  <p className="font-bold text-gray-900">
                    {(() => {
                      // Tutaj sprawdzamy update_at (Twoja nazwa z bazy)
                      const rawDate = shipment?.update_at || shipment?.updated_at || shipment?.created_at;
                      if (!rawDate) return "Brak danych";
                      const d = new Date(rawDate);
                      if (isNaN(d.getTime())) return "Błędny format";
                      return d.toLocaleString("pl-PL", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      });
                    })()}
                  </p>
                </div>
              </div>

              {/* WIZUALNY PASEK POSTĘPU */}
              <div className="relative mb-12 mt-4">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      shipment.status === 'DOSTARCZONO' ? 'w-full bg-green-500' : 'w-1/2 bg-red-600'
                    }`} 
                  />
                </div>
                <div className="flex justify-between mt-4">
                   <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase">Załadunek</p>
                      <p className="font-bold text-sm uppercase italic">{shipment.origin}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-red-600 uppercase italic">Aktualna pozycja</p>
                      <p className="font-black text-sm uppercase italic bg-red-50 px-3 py-1 rounded-lg">
                        {shipment.current_location || "W drodze"}
                      </p>
                   </div>
                   <div className="text-center text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase">Cel</p>
                      <p className="font-bold text-sm uppercase italic">{shipment.destination}</p>
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Kierunek</p>
                      <p className="font-bold uppercase italic text-gray-900">{shipment.origin} → {shipment.destination}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center p-8 bg-black rounded-[2.5rem] text-white shadow-xl shadow-gray-200">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Kierowca</p>
                  <p className="text-3xl font-black uppercase italic leading-none mb-4">{shipment.driver_name}</p>
                  <div className="flex items-center gap-2 text-red-500">
                    <Package className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ładunek zabezpieczony</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}