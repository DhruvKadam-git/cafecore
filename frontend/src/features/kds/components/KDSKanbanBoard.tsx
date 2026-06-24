"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  KDSOrder,
  KDSStage,
  KDS_STAGE_LABELS,
  KDS_STAGES,
  columnIdFromStage,
  stageFromColumnId,
} from "@/lib/kds-types";
import { KDSOrderCard } from "./KDSOrderCard";

interface KDSKanbanBoardProps {
  orders: KDSOrder[];
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
  onMoveOrder: (id: string, targetStage: KDSStage) => void;
  highlightStage?: KDSStage | null;
}

const columnAccent: Record<KDSStage, string> = {
  "to-cook": "border-t-kds-amber",
  preparing: "border-t-kds-orange",
  ready: "border-t-kds-green",
};

const columnHeaderText: Record<KDSStage, string> = {
  "to-cook": "text-kds-amber",
  preparing: "text-kds-orange",
  ready: "text-kds-green",
};

function ColumnHeader({ stage, count, avgWait }: { stage: KDSStage; count: number; avgWait: number }) {
  return (
    <div className="shrink-0 px-4 py-3 border-b border-kds-border/40">
      <div className="flex items-center justify-between">
        <h2
          className={`text-[13px] font-bold uppercase tracking-wider ${columnHeaderText[stage]}`}
        >
          {KDS_STAGE_LABELS[stage]}
        </h2>
        <span className="text-[20px] font-bold text-kds-text tabular-nums">{count}</span>
      </div>
      {count > 0 && (
        <p className="text-[11px] font-medium text-kds-muted mt-0.5">avg {avgWait}m wait</p>
      )}
    </div>
  );
}

function StaticKanbanColumn({
  stage,
  orders,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
  highlightStage,
}: {
  stage: KDSStage;
  orders: KDSOrder[];
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
  highlightStage?: KDSStage | null;
}) {
  const avgWait =
    orders.length > 0
      ? Math.round(orders.reduce((sum, o) => sum + o.elapsed, 0) / orders.length)
      : 0;

  return (
    <section
      id={`kds-column-${stage}`}
      className={`flex flex-col h-full min-h-0 rounded-xl bg-kds-column-header-bg/40 border border-kds-border/50 border-t-4 ${columnAccent[stage]} ${
        highlightStage === stage ? "ring-2 ring-kds-amber/40" : ""
      }`}
    >
      <ColumnHeader stage={stage} count={orders.length} avgWait={avgWait} />

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-6 flex flex-col gap-[var(--kds-card-gap)] no-scrollbar">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-kds-muted gap-1 shrink-0">
            <p className="text-[13px] font-medium">No orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="shrink-0">
              <KDSOrderCard
                order={order}
                onAdvanceStage={onAdvanceStage}
                onDismiss={onDismiss}
                onToggleItem={onToggleItem}
                isKanban
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DraggableKanbanCard({
  order,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
}: {
  order: KDSOrder;
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: order.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      <KDSOrderCard
        order={order}
        onAdvanceStage={onAdvanceStage}
        onDismiss={onDismiss}
        onToggleItem={onToggleItem}
        showDragHandle
        isDragging={isDragging}
        isKanban
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
        setDragHandleRef={setActivatorNodeRef}
      />
    </div>
  );
}

function KanbanColumn({
  stage,
  orders,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
  highlightStage,
}: {
  stage: KDSStage;
  orders: KDSOrder[];
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
  highlightStage?: KDSStage | null;
}) {
  const columnId = columnIdFromStage(stage);
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  const avgWait =
    orders.length > 0
      ? Math.round(orders.reduce((sum, o) => sum + o.elapsed, 0) / orders.length)
      : 0;

  return (
    <section
      id={`kds-column-${stage}`}
      className={`flex flex-col h-full min-h-0 rounded-xl bg-kds-column-header-bg/40 border border-kds-border/50 border-t-4 ${columnAccent[stage]} ${
        highlightStage === stage ? "ring-2 ring-kds-amber/40" : ""
      } ${isOver ? "kds-column-drop-active" : ""}`}
    >
      <ColumnHeader stage={stage} count={orders.length} avgWait={avgWait} />

      <div
        ref={setNodeRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-6 flex flex-col gap-[var(--kds-card-gap)] no-scrollbar"
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-kds-muted gap-1 shrink-0">
            <p className="text-[13px] font-medium">No orders</p>
            <p className="text-[11px]">Drop here</p>
          </div>
        ) : (
          orders.map((order) => (
            <DraggableKanbanCard
              key={order.id}
              order={order}
              onAdvanceStage={onAdvanceStage}
              onDismiss={onDismiss}
              onToggleItem={onToggleItem}
            />
          ))
        )}
      </div>
    </section>
  );
}

function KanbanGrid({
  orders,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
  highlightStage,
  dndEnabled,
}: {
  orders: KDSOrder[];
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
  highlightStage?: KDSStage | null;
  dndEnabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      {KDS_STAGES.map((stage) => {
        const stageOrders = orders.filter((o) => o.stage === stage);
        const Column = dndEnabled ? KanbanColumn : StaticKanbanColumn;

        return (
          <Column
            key={stage}
            stage={stage}
            orders={stageOrders}
            onAdvanceStage={onAdvanceStage}
            onDismiss={onDismiss}
            onToggleItem={onToggleItem}
            highlightStage={highlightStage}
          />
        );
      })}
    </div>
  );
}

export function KDSKanbanBoard({
  orders,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
  onMoveOrder,
  highlightStage,
}: KDSKanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveOrderId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOrderId(null);
    const { active, over } = event;
    if (!over) return;

    const targetStage = stageFromColumnId(String(over.id));
    if (!targetStage) return;

    const orderId = String(active.id);
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.stage === targetStage) return;

    onMoveOrder(orderId, targetStage);
  };

  const handleDragCancel = () => {
    setActiveOrderId(null);
  };

  if (!mounted) {
    return (
      <KanbanGrid
        orders={orders}
        onAdvanceStage={onAdvanceStage}
        onDismiss={onDismiss}
        onToggleItem={onToggleItem}
        highlightStage={highlightStage}
        dndEnabled={false}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <KanbanGrid
        orders={orders}
        onAdvanceStage={onAdvanceStage}
        onDismiss={onDismiss}
        onToggleItem={onToggleItem}
        highlightStage={highlightStage}
        dndEnabled
      />

      <DragOverlay dropAnimation={null}>
        {activeOrder ? (
          <div className="opacity-90 rotate-1 scale-[1.02]">
            <KDSOrderCard
              order={activeOrder}
              onAdvanceStage={() => {}}
              onDismiss={() => {}}
              onToggleItem={() => {}}
              showDragHandle
              isKanban
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
