"use client";

import { useCallback, useState } from "react";
import { ticketApi } from "@/client/api/ticketApi";
import { COLUMN_ORDER } from "@/shared/constants";
import type { BoardData } from "@/shared/types";

export const useTickets = (initialBoard: BoardData) => {
  const [board, setBoard] = useState(initialBoard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await ticketApi.fetchTickets();
      setBoard(response.board);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const total = COLUMN_ORDER.reduce(
    (sum, status) => sum + board[status].length,
    0,
  );

  return {
    board,
    isRefreshing,
    refresh,
    total,
  };
};
