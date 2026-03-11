import { prisma } from "./lib/db.js";

async function check() {
  const news = await prisma.news.findFirst({
    where: { source: "Ars Technica AI", status: "PENDING" },
    select: { title: true, content: true }
  });
  if (news) {
    console.log("Title:", news.title);
    console.log("End:", news.content?.slice(-200));
  }
  await prisma.$disconnect();
}

check();
