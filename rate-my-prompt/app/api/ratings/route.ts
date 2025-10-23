import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ratings = await prisma.rating.findMany({
    include: {
      prompt: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(ratings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { llm, score, comment, promptId, userId } = body;

  const rating = await prisma.rating.create({
    data: {
      llm,
      score,
      comment,
      promptId,
      userId
    },
  });

  return NextResponse.json(rating);
}
