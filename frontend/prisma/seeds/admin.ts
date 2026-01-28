import { seedPrismaClient as prisma } from "../seedPrismaClient";
import bcrypt from "bcrypt";

export const prettyMsg = {
  line(char = "─", len = 60) {
    return char.repeat(len);
  },
  section(title: string) {
    console.log("\n" + this.line());
    console.log(`▶ ${title}`);
    console.log(this.line());
  },

  step(msg: string) {
    console.log(`• ${msg}`);
  },

  success(msg: string) {
    console.log(`✓ ${msg}`);
  },

  warn(msg: string) {
    console.warn(`! ${msg}`);
  },
};

export async function addAdminScript() {
  prettyMsg.section("ADMIN SEED SCRIPT START");

  prettyMsg.step("Reading admin credentials from environment variables");

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    prettyMsg.warn("ADMIN_USERNAME or ADMIN_PASSWORD not provided");
    prettyMsg.warn("Persisting last known admin state");
    prettyMsg.section("ADMIN SEED SKIPPED");
    return;
  }

  prettyMsg.step(`Validating username: "${adminUsername}"`);
  const existingUser = await prisma.user.findUnique({
    where: {
      username: adminUsername,
    },
  });
  if (existingUser?.role === "USER")
    throw new Error(
      "a non-admin user already exists for provided admin credentials",
    );

  prettyMsg.step("Normalizing admin state (only single-admin allowed)");
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.$transaction([
    prisma.user.deleteMany({ where: { role: "ADMIN" } }),
    prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        role: "ADMIN",
        cover_url: "",
      },
    }),
  ]);
  prettyMsg.success("Admin normalized successfully");
  prettyMsg.section("ADMIN SEED COMPLETE");
}
