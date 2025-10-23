import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const prompts = await prisma.prompt.findMany({
    include: { ratings: true, author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prompts);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { title, text, tags } = body;

    // If user is authenticated, ensure they exist in our database
    if (userId) {
      const clerkUser = await currentUser();

      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.lastName || null;

        // Upsert user to ensure they exist in our database
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            email,
            name,
            imageUrl: clerkUser.imageUrl,
          },
          create: {
            id: userId,
            email: email || `${userId}@placeholder.com`,
            name,
            imageUrl: clerkUser.imageUrl,
          },
        });
      }
    }

    const prompt = await prisma.prompt.create({
      data: {
        title,
        text,
        tags,
        authorId: userId || null
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
