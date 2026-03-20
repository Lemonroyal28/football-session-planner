-- Add Who/Where/What/Why/Which coaching context fields to drills
ALTER TABLE public.drills
  ADD COLUMN IF NOT EXISTS who_context TEXT,
  ADD COLUMN IF NOT EXISTS where_context TEXT,
  ADD COLUMN IF NOT EXISTS what_context TEXT,
  ADD COLUMN IF NOT EXISTS why_context TEXT,
  ADD COLUMN IF NOT EXISTS which_context TEXT;

-- Add Who/Where/What/Why/Which coaching context fields to session_blocks
ALTER TABLE public.session_blocks
  ADD COLUMN IF NOT EXISTS who_context TEXT,
  ADD COLUMN IF NOT EXISTS where_context TEXT,
  ADD COLUMN IF NOT EXISTS what_context TEXT,
  ADD COLUMN IF NOT EXISTS why_context TEXT,
  ADD COLUMN IF NOT EXISTS which_context TEXT;

COMMENT ON COLUMN public.drills.who_context IS 'Which players, roles, or units are involved';
COMMENT ON COLUMN public.drills.where_context IS 'Which pitch area or game space';
COMMENT ON COLUMN public.drills.what_context IS 'What football action or principle is being trained';
COMMENT ON COLUMN public.drills.why_context IS 'Why the action matters';
COMMENT ON COLUMN public.drills.which_context IS 'In which game situation or trigger this applies';
