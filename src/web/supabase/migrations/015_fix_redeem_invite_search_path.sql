-- Pin search_path on the SECURITY DEFINER redeem_invite function to prevent search_path hijacking.
alter function public.redeem_invite(text) set search_path = public;
