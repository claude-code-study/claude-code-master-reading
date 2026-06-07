import { Board } from "@/client/components/board/Board";
import { ticketService } from "@/server/services/ticketService";

const BoardPage = async () => {
  const { board, total } = await ticketService.getAll();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Tika</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              Ticket Board
            </h1>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            {total} tickets
          </div>
        </header>
        <Board initialBoard={board} />
      </div>
    </main>
  );
};

export default BoardPage;
