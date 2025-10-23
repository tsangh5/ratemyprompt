import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prompts = await prisma.prompt.findMany({
    include: { ratings: true, author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prompts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, text, tags, authorId } = body;
  const prompt = await prisma.prompt.create({
    data: { title, text, tags, authorId },
  });
  return NextResponse.json(prompt);
}
