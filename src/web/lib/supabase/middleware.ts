import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasModuleAccess, pathToModule } from '../access/module-access';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth');
  const isCallbackRoute = pathname.startsWith('/auth/callback');
  const isOnboardingRoute = pathname.startsWith('/auth/onboarding');

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !isCallbackRoute && !isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (user && !isCallbackRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/onboarding';
      return NextResponse.redirect(url);
    }

    if (profile?.organization_id && isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (profile?.organization_id) {
      const moduleKey = pathToModule(pathname);
      if (moduleKey) {
        const allowed = await hasModuleAccess(supabase, user.id, profile.role, moduleKey);
        if (!allowed) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.set('access_denied', moduleKey);
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
