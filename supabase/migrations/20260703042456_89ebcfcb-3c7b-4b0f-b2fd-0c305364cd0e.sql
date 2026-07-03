
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname IN ('bot-heartbeat','wallet-cleanup');

SELECT cron.schedule(
  'bot-heartbeat',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--8a5b8ddc-26a4-4ba7-a5bc-ee13a0d9ff09-dev.lovable.app/api/public/cron/heartbeat',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoenNxdnZ1Ynhhc3lvdWtsaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjg2MzQsImV4cCI6MjA5ODYwNDYzNH0.qJUW5his818K2NdvtxYG2dsp_fkbMvfCLfzd8WILW3E"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'wallet-cleanup',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--8a5b8ddc-26a4-4ba7-a5bc-ee13a0d9ff09-dev.lovable.app/api/public/cron/wallet-cleanup',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoenNxdnZ1Ynhhc3lvdWtsaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjg2MzQsImV4cCI6MjA5ODYwNDYzNH0.qJUW5his818K2NdvtxYG2dsp_fkbMvfCLfzd8WILW3E"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
