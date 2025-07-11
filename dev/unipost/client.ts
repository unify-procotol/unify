import { repo, URPC } from "@unilab/urpc";
import { ProjectEntity } from "./entities/project";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demoProjects = async () => {
  console.log("🚀 Testing PostgreSQL Projects API");

  try {
    // Create a new project
    console.log("\n📝 Creating a new project...");
    const newProject = await repo<ProjectEntity>({
      entity: "project",
      source: "postgres",
    }).create({
      data: {
        uid: 123,
        name: "My Blog Project",
        ghost_api_key: "0e7c6d898338044caa7769b3c8",
        ghost_domain: "https://blog.depinscan.io",
        locales: ["en", "zh-CN"],
      },
    });
    console.log("✅ Created project:", newProject);

    // Find all projects
    console.log("\n🔍 Finding all projects...");
    const allProjects = await repo<ProjectEntity>({
      entity: "project",
      source: "postgres",
    }).findMany({
      order_by: { created_at: "desc" },
      limit: 10,
    });
    console.log("✅ Found projects:", allProjects.length);
    allProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (ID: ${project.id})`);
    });

    // Find projects for a specific user
    console.log("\n🔍 Finding projects for uid = 123...");
    const userProjects = await repo<ProjectEntity>({
      entity: "project",
      source: "postgres",
    }).findMany({
      where: { uid: 123 },
      order_by: { created_at: "desc" },
    });
    console.log("✅ Found user projects:", userProjects.length);

    // Find a specific project
    if (newProject.id) {
      console.log("\n🔍 Finding project by ID...");
      const foundProject = await repo<ProjectEntity>({
        entity: "project",
        source: "postgres",
      }).findOne({
        where: { id: newProject.id },
      });
      console.log("✅ Found project:", foundProject?.name);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
};

const demo = async () => {
  await demoProjects();
  // await demoPosts();
};

demo();
