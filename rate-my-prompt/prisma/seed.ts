import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Creative Writing",
    slug: "creative-writing",
    description: "Prompts for storytelling, poetry, and creative content",
    icon: "✍️",
    color: "#8B5CF6",
  },
  {
    name: "Code & Development",
    slug: "code-development",
    description: "Programming, debugging, and software development prompts",
    icon: "💻",
    color: "#10B981",
  },
  {
    name: "Business & Marketing",
    slug: "business-marketing",
    description: "Marketing copy, business strategy, and sales prompts",
    icon: "📊",
    color: "#3B82F6",
  },
  {
    name: "Education & Learning",
    slug: "education-learning",
    description: "Teaching, tutoring, and educational content prompts",
    icon: "📚",
    color: "#F59E0B",
  },
  {
    name: "Data & Analysis",
    slug: "data-analysis",
    description: "Data analysis, research, and analytical prompts",
    icon: "📈",
    color: "#EF4444",
  },
  {
    name: "Design & Art",
    slug: "design-art",
    description: "Visual design, UI/UX, and artistic prompts",
    icon: "🎨",
    color: "#EC4899",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Task management, organization, and efficiency prompts",
    icon: "⚡",
    color: "#6366F1",
  },
  {
    name: "General",
    slug: "general",
    description: "General purpose and miscellaneous prompts",
    icon: "🌟",
    color: "#6B7280",
  },
];

async function main() {
  console.log("Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("Seeding completed!");
}

// Add some sample prompts (run this after categories are seeded)
async function seedPrompts() {
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.log("No categories found, skipping prompts seed");
    return;
  }

  const samplePrompts = [
    {
      title: "Write a Blog Post",
      text: "Write a comprehensive blog post about [TOPIC] that includes an engaging introduction, 3-5 main points with examples, and a strong conclusion with a call to action.",
      tags: ["writing", "blogging", "content"],
      categoryId: categories.find(c => c.slug === "creative-writing")?.id,
    },
    {
      title: "Debug Python Code",
      text: "I have the following Python code that's throwing an error. Can you help me identify the issue and provide a corrected version?\n\n[PASTE YOUR CODE HERE]",
      tags: ["python", "debugging", "code-review"],
      categoryId: categories.find(c => c.slug === "code-development")?.id,
    },
    {
      title: "Create Marketing Email",
      text: "Create a compelling marketing email for [PRODUCT/SERVICE] that highlights its key benefits, addresses customer pain points, and includes a clear CTA. Keep it under 200 words.",
      tags: ["email", "marketing", "copywriting"],
      categoryId: categories.find(c => c.slug === "business-marketing")?.id,
    },
  ];

  for (const prompt of samplePrompts) {
    await prisma.prompt.create({
      data: prompt,
    });
  }

  console.log("Sample prompts seeded!");
}

// Call seedPrompts after main completes
main()
  .then(() => seedPrompts())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
