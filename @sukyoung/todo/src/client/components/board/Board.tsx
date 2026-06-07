"use client";

import { DndContext } from "@dnd-kit/core";
import { Column } from "@/client/components/board/Column";
import { useTickets } from "@/client/hooks/useTickets";
import { COLUMN_ORDER } from "@/shared/constants";
import type { BoardData } from "@/shared/types";

type BoardProps = {
  initialBoard: BoardData;
};

export const Board = ({ initialBoard }: BoardProps) => {
  const { board, isRefreshing, total } = useTickets(initialBoard);

  const handleDragEnd = () => {
    return;
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Board</span>
        <span>{isRefreshing ? "Refreshing" : `${total} active`}</span>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-4">
          {COLUMN_ORDER.map((status) => (
            <Column key={status} status={status} tickets={board[status]} />
          ))}
        </div>
      </DndContext>
    </section>
  );
};
