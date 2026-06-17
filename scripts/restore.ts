import { execSync } from "child_process";

try {
  console.log("Restoring file via git...");
  const out = execSync("git checkout src/core/pdf-operations.ts");
  console.log("Success:", out.toString());
} catch (e: any) {
  console.error("Error restoring:", e.message, e.stderr?.toString());
}
