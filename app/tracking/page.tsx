"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Truck, MapPin, Package, Search, Loader2 } from "lucide-react";

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShipment(null);

    // Szukamy przesyłki w bazie Supabase po numerze zamówienia
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_number", searchQuery.toUpperCase())
      .single();

    if (error) {
      setError("Nie znaleziono przesyłki o tym numerze.");
    } else {
      setShipment(data);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* NAGŁÓWEK */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
            System Śledzenia <span className="text-red-600">Wantranz</span>
          </h1>
          <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">
            Wprowadź numer zamówienia, aby sprawdzić status ładunku
          </p>
        </div>

        {/* WYSZUKIWARKA */}
        <form onSubmit={handleTrack} className="relative mb-12">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="NP. WT-1001"
            className="w-full bg-white border-2 border-gray-100 p-6 rounded-3xl shadow-xl outline-none focus:border-red-600 transition-all font-black italic text-xl uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 bg-red-600 text-white px-8 rounded-2xl font-black uppercase italic hover:bg-black transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? "Szukam..." : "Szukaj"}
          </button>
        </form>

        {/* WYNIK */}
        {error && <p className="text-center text-red-600 font-bold">{error}</p>}

        {shipment && (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black bg-red-50 text-red-600 px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Status: {shipment.status}
                  </span>
                  <h2 className="text-4xl font-black uppercase italic mt-4">
                    {shipment.order_number}
                  </h2>
                </div>
                <Truck className="w-12 h-12 text-gray-200" />
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">
                        Skąd
                      </p>
                      <p className="font-bold uppercase italic">
                        {shipment.origin}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">
                        Dokąd
                      </p>
                      <p className="font-bold uppercase italic">
                        {shipment.destination}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">
                    Kierowca
                  </p>
                  <p className="text-xl font-black uppercase italic">
                    {shipment.driver_name}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Ostatnia aktualizacja
                    </span>
                    <span className="text-[10px] font-bold">
                      {shipment.updated_at
                        ? new Date(shipment.updated_at).toLocaleString(
                            "pl-PL",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Brak danych"}
                    </span>
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
