const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing connection to:", supabaseUrl);
  const { data, error } = await supabase.from("action_items").select("*").limit(1);
  if (error) {
    console.error("Supabase connection failed:", error.message);
    process.exit(1);
  } else {
    console.log("Supabase connected successfully! Found", data.length, "items in action_items.");
    process.exit(0);
  }
}

testConnection();
