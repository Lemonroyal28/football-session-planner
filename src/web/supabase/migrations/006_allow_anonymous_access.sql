-- Make user_id nullable on all tables that require it
ALTER TABLE public.sessions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.drills ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.session_templates ALTER COLUMN user_id DROP NOT NULL;

-- Add anonymous SELECT policies (allow reading all rows when not authenticated)
CREATE POLICY "anon_select_sessions" ON public.sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_sessions" ON public.sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_sessions" ON public.sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_sessions" ON public.sessions FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_session_blocks" ON public.session_blocks FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_session_blocks" ON public.session_blocks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_session_blocks" ON public.session_blocks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_session_blocks" ON public.session_blocks FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_drills" ON public.drills FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_drills" ON public.drills FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_drills" ON public.drills FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_drills" ON public.drills FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_teams" ON public.teams FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_teams" ON public.teams FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_teams" ON public.teams FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_teams" ON public.teams FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_players" ON public.players FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_players" ON public.players FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_players" ON public.players FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_players" ON public.players FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_templates" ON public.session_templates FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_templates" ON public.session_templates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_templates" ON public.session_templates FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_templates" ON public.session_templates FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_attendance" ON public.attendance_records FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_attendance" ON public.attendance_records FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_attendance" ON public.attendance_records FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance" ON public.attendance_records FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_profiles" ON public.profiles FOR SELECT TO anon USING (true);
