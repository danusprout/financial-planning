alter table public.budgets
add column if not exists bank_id uuid references public.banks (id) on delete set null;

create index if not exists budgets_bank_id_idx on public.budgets (bank_id);
