"use client";

import React from "react";
import { X, Users } from "lucide-react";
import { useAsyncData } from "@/hooks/use-async-data";
import { floorsApi, mapFloorsToPOSTables } from "@/lib/api";

interface Table {
  id: string;
  number: string;
  seats: number;
  hasOrder: boolean;
}

interface FloorPopupProps {
  onClose: () => void;
  onSelectTable: (table: Table) => void;
}

export function FloorPopup({ onClose, onSelectTable }: FloorPopupProps) {
  const { data: floors, loading, error, reload } = useAsyncData(async () => {
    const apiFloors = await floorsApi.getFloorsWithTables();
    return mapFloorsToPOSTables(apiFloors);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[640px] max-h-[85vh] overflow-y-auto shadow-2xl theme-transition">
        <div className="flex items-center justify-between p-6 border-b border-border-custom">
          <div>
            <h2 className="text-[20px] font-bold text-text-heading">Select a Table</h2>
            <p className="text-[13px] text-text-muted mt-0.5">Choose a table to start or continue an order</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-surface text-text-muted transition-colors theme-transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 pt-4 text-[12px] font-semibold text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[4px] bg-surface border border-border-custom theme-transition" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[4px] bg-primary" />
            Has Active Order
          </div>
        </div>

        <div className="p-6 flex flex-col gap-7">
          {loading && <p className="text-text-muted text-center py-8">Loading tables...</p>}
          {error && (
            <div className="text-center py-8">
              <p className="text-danger font-semibold mb-2">{error}</p>
              <button type="button" onClick={reload} className="text-primary font-bold">
                Retry
              </button>
            </div>
          )}
          {floors?.map((floor) => (
            <div key={floor.id}>
              <h3 className="text-[14px] font-bold text-text-muted uppercase tracking-wider mb-3">{floor.name}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {floor.tables.map((table) => {
                  const hasOrder = table.status === "occupied";
                  return (
                    <button
                      key={table.id}
                      onClick={() =>
                        onSelectTable({
                          id: table.id,
                          number: table.label,
                          seats: table.seats,
                          hasOrder,
                        })
                      }
                      className={`relative flex flex-col items-center justify-center gap-1.5 h-[90px] rounded-[16px] border-2 font-sans transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${
                        hasOrder
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-surface border-border-custom text-text-heading hover:border-primary hover:bg-primary/10"
                      }`}
                    >
                      {hasOrder && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                      )}
                      <span className="text-[18px] font-bold leading-none">{table.label}</span>
                      <div className={`flex items-center gap-1 text-[11px] font-semibold ${hasOrder ? "text-white/80" : "text-text-muted"}`}>
                        <Users size={11} />
                        {table.seats}
                      </div>
                      {hasOrder && (
                        <span className="text-[10px] font-bold text-white/90">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
