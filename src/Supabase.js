import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jgrgqwbbhcnyphszitis.supabase.co'
const supabaseKey = 'sb_publishable_fTKW-saMC2YHNmpqAYSr7g_kkleYUOh '

export const supabase = createClient(supabaseUrl, supabaseKey)