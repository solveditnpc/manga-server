import { addAdminScript } from "./seeds/admin";

async function main() {
  await addAdminScript();
}

main()
  .then(() => {
    console.log("Seed complete");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
