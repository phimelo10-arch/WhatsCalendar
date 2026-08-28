import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swnkaxqygxsekttnauqm.supabase.co';
const supabaseKey = 'sb_publishable_CKu-J81Qh0HmAnvT0X98EA_w17blpEL';

export const supabase = createClient(supabaseUrl, supabaseKey);
