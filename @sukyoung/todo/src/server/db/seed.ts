import { db } from "./index";
import { tickets } from "./schema";

const seed = async () => {
  await db.insert(tickets).values({
    title: "첫 티켓 작성",
    description: "Tika 보드의 초기 데이터입니다.",
    status: "BACKLOG",
    priority: "MEDIUM",
    position: 1,
  });
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
