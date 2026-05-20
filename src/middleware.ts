import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ROLE_ROUTES: Record<string, string[]> = {
  '/':                 ['admin', 'gerente'],
  '/transacciones':    ['admin', 'gerente', 'cajero'],
  '/clientes':         ['admin', 'gerente', 'servicio_al_cliente'],
  '/cuentas':          ['admin', 'gerente', 'servicio_al_cliente'],
  '/atencion-cliente': ['admin', 'gerente', 'servicio_al_cliente'],
  '/reportes':         ['admin', 'gerente'],
  '/usuarios':         ['admin'],
  '/auditoria':        ['admin'],
  '/mantenimiento':    ['admin'],
};

function getDefaultRoute(roles: string[]): string {
  if (roles.includes('admin') || roles.includes('gerente')) return '/';
  if (roles.includes('cajero')) return '/transacciones';
  if (roles.includes('servicio_al_cliente')) return '/clientes';
  if (roles.includes('banco')) return '/sin-acceso';
  return '/';
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const tokenUser = token?.user as { roles?: unknown } | undefined;
    const rawRoles = tokenUser?.roles;
    const roles: string[] = Array.isArray(rawRoles) ? (rawRoles as string[]) : [];
    const { pathname } = req.nextUrl;

    // /sin-acceso no necesita ninguna verificación adicional
    if (pathname === '/sin-acceso') {
      return NextResponse.next();
    }

    // Banco: redirigir a /sin-acceso para cualquier otra ruta
    if (roles.includes('banco')) {
      return NextResponse.redirect(new URL('/sin-acceso', req.url));
    }

    // Verificar acceso a rutas protegidas
    for (const [route, allowed] of Object.entries(ROLE_ROUTES)) {
      const matches =
        route === '/'
          ? pathname === '/'
          : pathname === route || pathname.startsWith(route + '/');

      if (matches && !allowed.some((r) => roles.includes(r))) {
        return NextResponse.redirect(new URL(getDefaultRoute(roles), req.url));
      }
    }
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Excluye api/auth, login, _next, archivos estáticos y /sin-acceso del matcher
  matcher: ['/((?!api/auth|login|sin-acceso|_next|.*\\..*).*)', '/sin-acceso'],
};
