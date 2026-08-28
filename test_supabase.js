import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swnkaxqygxsekttnauqm.supabase.co';
const supabaseKey = 'sb_publishable_CKu-J81Qh0HmAnvT0X98EA_w17blpEL';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing insert...");
  const { data: iData, error: iError } = await supabase.schema('whats_calendar').from('projects').upsert({
      id: "test",
      name: "test",
      updatedAt: new Date().toISOString(),
      isFreeMode: true,
      slides: []
  });
  console.log("Insert Error:", iError);

  console.log("Testing fetch...");
  const { data, error } = await supabase.schema('whats_calendar').from('projects').select('*');
  console.log("Fetch Error:", error);
  console.log("Fetch Data:", data);
}

test();
