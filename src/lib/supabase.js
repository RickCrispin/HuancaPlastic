import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ydbakaywbfqspqywtfdi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYmFrYXl3YmZxc3BxeXd0ZmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDI0OTMsImV4cCI6MjA4MDE3ODQ5M30.eZVH2GKYYUomEut9D0kblf8SGpo4VeZElqVFEWdzW04';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
