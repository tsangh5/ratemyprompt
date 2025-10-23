import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || null;

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

    const body = await req.json();
    const { llm, score, comment } = body;

    // Validate score
    if (typeof score !== "number" || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if user already rated this prompt
    const existingRating = await prisma.rating.findFirst({
      where: {
        promptId: id,
        userId,
      },
    });

    if (existingRating) {
      // Update existing rating
      const rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { llm, score, comment },
      });
      return NextResponse.json(rating);
    }

    // Create new rating
    const rating = await prisma.rating.create({
      data: {
        llm,
        score,
        comment,
        promptId: id,
        userId,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ratings = await prisma.rating.findMany({
      where: { promptId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
