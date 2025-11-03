alter table public.tasks
  add column if not exists ai_breakdown jsonb;
