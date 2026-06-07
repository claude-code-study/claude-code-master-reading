import { render, screen } from "@testing-library/react";
import { Board } from "@/client/components/board/Board";

const emptyBoard = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  DONE: [],
};

describe("Board", () => {
  it("renders all kanban columns", () => {
    render(<Board initialBoard={emptyBoard} />);

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
