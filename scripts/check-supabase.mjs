import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xcdnophqazxcpeavmthu.supabase.co', 'sb_publishable_wtRThtuOiTFpzGvjk9H2NA_rHtLxCrE');

const { data, error } = await supabase
  .from('tzaddikim')
  .select('*')
  .eq('hebrew_day', 1)
  .eq('hebrew_month', 'תשרי')
  .limit(5)

console.log({ error, data });
