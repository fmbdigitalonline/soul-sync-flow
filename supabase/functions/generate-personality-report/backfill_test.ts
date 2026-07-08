import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const USER_ID = "bb74faf0-0c5c-4abd-b9d1-a26681e3fc30";

Deno.test("backfill standard report for user", async () => {
  // 1) fetch active blueprint
  const bpRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_blueprints?user_id=eq.${USER_ID}&is_active=eq.true&select=blueprint&limit=1`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
  const rows = await bpRes.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("no blueprint");
  const blueprint = rows[0].blueprint;
  console.log("blueprint keys:", Object.keys(blueprint));

  // 2) invoke generate-personality-report
  const invokeRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-personality-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ blueprint, userId: USER_ID, language: "en" }),
  });
  const text = await invokeRes.text();
  console.log("status:", invokeRes.status);
  console.log("body head:", text.slice(0, 400));
  if (!invokeRes.ok) throw new Error(`invoke failed ${invokeRes.status}`);
});