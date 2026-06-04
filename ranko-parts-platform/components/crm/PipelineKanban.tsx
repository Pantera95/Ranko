"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { EstadoLead } from "@prisma/client";

import type { PipelineLead, PipelineStage } from "@/lib/crm";

type PipelineKanbanProps = {
  initialStages: PipelineStage[];
  isFallback: boolean;
};

export function PipelineKanban({ initialStages, isFallback }: PipelineKanbanProps) {
  const [stages, setStages] = useState(initialStages);
  const [message, setMessage] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const leadStageById = useMemo(() => {
    const map = new Map<string, EstadoLead>();
    stages.forEach((stage) => {
      stage.leads.forEach((lead) => map.set(lead.id, stage.id));
    });
    return map;
  }, [stages]);

  async function onDragEnd(event: DragEndEvent) {
    const leadId = String(event.active.id);
    const targetStage = event.over?.id as EstadoLead | undefined;
    const currentStage = leadStageById.get(leadId);

    if (!targetStage || !currentStage || currentStage === targetStage) {
      return;
    }

    const previousStages = stages;
    setStages(moveLead(stages, leadId, currentStage, targetStage));
    setMessage("");

    const response = await fetch(`/api/admin/leads/${leadId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: targetStage }),
    });

    if (!response.ok) {
      setStages(previousStages);
      setMessage(
        isFallback
          ? "Movimiento visual solamente: conecta la base y autentica un usuario admin para persistir."
          : "No se pudo guardar el cambio de etapa.",
      );
    }
  }

  return (
    <section className="mt-8">
      {message ? (
        <div
          className="mb-4 p-4 text-sm"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {message}
        </div>
      ) : null}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 overflow-x-auto xl:grid-cols-6">
          {stages.map((stage) => (
            <PipelineColumn key={stage.id} stage={stage} />
          ))}
        </div>
      </DndContext>
    </section>
  );
}

function PipelineColumn({ stage }: { stage: PipelineStage }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[520px] min-w-[260px] p-3"
      style={{
        background: "var(--bg-card)",
        border: isOver ? "1px solid var(--color-gold)" : "1px solid var(--border)",
      }}
    >
      <div className="pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase" style={{ color: "var(--text-primary)" }}>{stage.title}</h2>
          <span
            className="rounded px-2 py-1 font-mono text-xs text-[var(--color-gold)]"
            style={{ background: "var(--bg-elevated)" }}
          >
            {stage.leads.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-muted)" }}>{stage.description}</p>
      </div>
      <div className="mt-3 grid gap-3">
        {stage.leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} stageId={stage.id} />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead, stageId }: { lead: PipelineLead; stageId: EstadoLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { stageId },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        opacity: isDragging ? 0.6 : 1,
      }}
      className="cursor-grab p-4 shadow-lg transition active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black uppercase leading-tight">{lead.cliente}</h3>
          {lead.empresa ? (
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{lead.empresa}</p>
          ) : null}
        </div>
        <span className={temperatureClass(lead.temperatura)}>{lead.temperatura}</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <p className="font-mono text-xl font-black text-[var(--color-gold)]">{lead.valor}</p>
        <p>
          {lead.tipo} - {lead.ciudad ?? "Sin ciudad"}
        </p>
        <p>Vendedor: {lead.vendedor}</p>
        <p>Actualizado: {lead.updatedAt}</p>
      </div>
      {lead.notas ? (
        <p className="mt-4 text-xs leading-5" style={{ color: "var(--text-muted)" }}>{lead.notas}</p>
      ) : null}

      {/* Action footer — stopPropagation prevents the dnd handler from
          eating the click while keeping the rest of the card draggable. */}
      <div
        className="mt-3 flex flex-wrap gap-2 pt-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Link
          href={`/admin/clientes/${lead.clienteId}`}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase transition hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <ExternalLink size={10} /> Abrir cliente
        </Link>
        <Link
          href={`/admin/cotizaciones/nueva?clienteId=${lead.clienteId}`}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-black uppercase text-black transition hover:opacity-90"
          style={{ background: "var(--color-gold)" }}
        >
          <FileText size={10} /> Cotizar
        </Link>
      </div>
    </article>
  );
}

function temperatureClass(value: PipelineLead["temperatura"]) {
  if (value === "CALIENTE") {
    return "rounded bg-[var(--color-danger)] px-2 py-1 text-[10px] font-black uppercase text-white";
  }

  if (value === "TIBIO") {
    return "rounded bg-[var(--color-gold)] px-2 py-1 text-[10px] font-black uppercase text-black";
  }

  return "rounded px-2 py-1 text-[10px] font-black uppercase" + " bg-[var(--bg-elevated)] text-[var(--text-secondary)]";
}

function moveLead(
  stages: PipelineStage[],
  leadId: string,
  currentStage: EstadoLead,
  targetStage: EstadoLead,
) {
  let movingLead: PipelineLead | undefined;

  const withoutLead = stages.map((stage) => {
    if (stage.id !== currentStage) {
      return stage;
    }

    movingLead = stage.leads.find((lead) => lead.id === leadId);
    return {
      ...stage,
      leads: stage.leads.filter((lead) => lead.id !== leadId),
    };
  });

  if (!movingLead) {
    return stages;
  }

  const leadToMove = movingLead;

  return withoutLead.map((stage) => {
    if (stage.id !== targetStage) {
      return stage;
    }

    return {
      ...stage,
      leads: [leadToMove, ...stage.leads],
    };
  });
}
