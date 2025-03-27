import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthCenteredLayout } from 'src/layouts/auth-centered';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
};

const authJwt = {
  path: 'jwt',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthCenteredLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Jwt.SignInPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthCenteredLayout>
            <Jwt.SignUpPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
  ],
};

/** **************************************
 * Amplify
 *************************************** */
const Amplify = {
  SignInPage: lazy(() => import('src/pages/auth/amplify/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/amplify/sign-up')),
  VerifyPage: lazy(() => import('src/pages/auth/amplify/verify')),
  UpdatePasswordPage: lazy(() => import('src/pages/auth/amplify/update-password')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/amplify/reset-password')),
};

const authAmplify = {
  path: 'amplify',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthCenteredLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Amplify.SignInPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthCenteredLayout>
            <Amplify.SignUpPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify',
      element: (
        <AuthCenteredLayout>
          <Amplify.VerifyPage />
        </AuthCenteredLayout>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <AuthCenteredLayout>
          <Amplify.ResetPasswordPage />
        </AuthCenteredLayout>
      ),
    },
    {
      path: 'update-password',
      element: (
        <AuthCenteredLayout>
          <Amplify.UpdatePasswordPage />
        </AuthCenteredLayout>
      ),
    },
  ],
};

/** **************************************
 * Firebase
 *************************************** */
const Firebase = {
  SignInPage: lazy(() => import('src/pages/auth/firebase/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/firebase/sign-up')),
  VerifyPage: lazy(() => import('src/pages/auth/firebase/verify')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/firebase/reset-password')),
};

const authFirebase = {
  path: 'firebase',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthCenteredLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Firebase.SignInPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthCenteredLayout>
            <Firebase.SignUpPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify',
      element: (
        <AuthCenteredLayout>
          <Firebase.VerifyPage />
        </AuthCenteredLayout>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <AuthCenteredLayout>
          <Firebase.ResetPasswordPage />
        </AuthCenteredLayout>
      ),
    },
  ],
};

/** **************************************
 * Auth0
 *************************************** */
const Auth0 = {
  SignInPage: lazy(() => import('src/pages/auth/auth0/sign-in')),
  CallbackPage: lazy(() => import('src/pages/auth/auth0/callback')),
};

const authAuth0 = {
  path: 'auth0',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthCenteredLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Auth0.SignInPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'callback',
      element: (
        <GuestGuard>
          <Auth0.CallbackPage />
        </GuestGuard>
      ),
    },
  ],
};

/** **************************************
 * Supabase
 *************************************** */
const Supabase = {
  SignInPage: lazy(() => import('src/pages/auth/supabase/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/supabase/sign-up')),
  VerifyPage: lazy(() => import('src/pages/auth/supabase/verify')),
  UpdatePasswordPage: lazy(() => import('src/pages/auth/supabase/update-password')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/supabase/reset-password')),
};

const authSupabase = {
  path: 'supabase',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthCenteredLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Supabase.SignInPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthCenteredLayout>
            <Supabase.SignUpPage />
          </AuthCenteredLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify',
      element: (
        <AuthCenteredLayout>
          <Supabase.VerifyPage />
        </AuthCenteredLayout>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <AuthCenteredLayout>
          <Supabase.ResetPasswordPage />
        </AuthCenteredLayout>
      ),
    },
    {
      path: 'update-password',
      element: (
        <AuthCenteredLayout>
          <Supabase.UpdatePasswordPage />
        </AuthCenteredLayout>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt, authAmplify, authFirebase, authAuth0, authSupabase],
  },
];
