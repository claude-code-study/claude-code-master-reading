import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const seed = async () => {
  const [{ db, queryClient }, { tickets }] = await Promise.all([
    import("./index"),
    import("./schema"),
  ]);

  await db.insert(tickets).values([
    {
      title: "프로젝트 요구사항 정리",
      status: "DONE",
      priority: "HIGH",
      position: 0,
      completedAt: new Date(),
    },
    {
      title: "API 설계 문서 작성",
      status: "IN_PROGRESS",
      priority: "HIGH",
      position: 1024,
    },
    {
      title: "로그인페이지구현",
      status: "TODO",
      priority: "MEDIUM",
      position: 0,
      startedAt: new Date(),
    },
    {
      title: "알림 기능 조사",
      status: "BACKLOG",
      priority: "LOW",
      position: 0,
    },
  ]);

  console.log("시드 데이터 삽입 완료");

  await queryClient.end();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
