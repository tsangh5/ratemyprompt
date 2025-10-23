import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const whereClause: any = {};

    // Handle trending - get prompts from last 7 days with most ratings
    if (categoryId === "trending") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const prompts = await prisma.prompt.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        include: {
          ratings: true,
          author: { select: { id: true, name: true } },
          category: true,
        },
      });

      // Sort by number of ratings
      const sortedPrompts = prompts.sort((a, b) => b.ratings.length - a.ratings.length);
      return NextResponse.json(sortedPrompts);
    }

    if (categoryId && categoryId !== "trending") {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { text: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const prompts = await prisma.prompt.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        ratings: true,
        author: { select: { id: true, name: true } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { title, text, tags, categoryId } = body;

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
        categoryId: categoryId || null,
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
