import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { ADMIN, loadEnv } from "./env";

/** Creates (or resets) the e2e admin account through backend/scripts/create-admin.mjs. */
export default async function globalSetup() {
  loadEnv();
  const script = resolve(__dirname, "../../backend/scripts/create-admin.mjs");
  execFileSync("node", [script, ADMIN.email, ADMIN.password, "admin"], { stdio: "inherit", env: process.env });
}
