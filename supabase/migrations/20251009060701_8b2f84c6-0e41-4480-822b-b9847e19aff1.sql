-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the abandoned cart reminder function to run every day at 10:00 AM
SELECT cron.schedule(
  'send-abandoned-cart-reminders',
  '0 10 * * *', -- Run at 10:00 AM daily
  $$
  SELECT
    net.http_post(
        url:='https://fgmpgyigalemroggekzd.supabase.co/functions/v1/send-abandoned-cart-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbXBneWlnYWxlbXJvZ2dla3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE1MTcsImV4cCI6MjA3NDY5NzUxN30.nfMNPfrO5us2KY8o4gEWgpe0AMBhJy6Tkrls1HXrtZE"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs, use:
-- SELECT * FROM cron.job;

-- To unschedule the job if needed, use:
-- SELECT cron.unschedule('send-abandoned-cart-reminders');