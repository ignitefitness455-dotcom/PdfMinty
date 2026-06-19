import { execSync } from "child_process";

try {
  console.log("Listing files in v16 tag via git...");
  const filesList = execSync("git ls-tree -r --name-only v16").toString();
  console.log("Files in v16:\n", filesList);

  console.log("Attempting to restore public/og-image.png from v16...");
  try {
    execSync("git show v16:public/og-image.png > public/og-image.png");
    console.log("Successfully restored public/og-image.png");
  } catch (err: any) {
    console.error("Failed to restore public/og-image.png:", err.message);
  }

  console.log("Attempting to restore public/logo.png from v16...");
  try {
    execSync("git show v16:public/logo.png > public/logo.png");
    console.log("Successfully restored public/logo.png");
  } catch (err: any) {
    console.error("Failed to restore public/logo.png:", err.message);
  }

  // Check if any fonts were in v16 under public/fonts
  const fonts = filesList.split("\n").filter(f => f.startsWith("public/fonts/"));
  if (fonts.length > 0) {
    console.log(`Found ${fonts.length} font files in v16. Restoring them...`);
    execSync("mkdir -p public/fonts");
    for (const font of fonts) {
      if (font.trim()) {
        try {
          execSync(`git show v16:${font} > ${font}`);
          console.log(`Restored ${font}`);
        } catch (err: any) {
          console.error(`Failed to restore ${font}:`, err.message);
        }
      }
    }
  } else {
    console.log("No fonts found in public/fonts/ in v16.");
  }

} catch (e: any) {
  console.error("Error running restore script:", e.message, e.stderr?.toString());
}

