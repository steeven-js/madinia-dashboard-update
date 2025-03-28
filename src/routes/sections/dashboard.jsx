import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/dashboard/user/account/general'));
const AccountBillingPage = lazy(() => import('src/pages/dashboard/user/account/billing'));
const AccountSocialsPage = lazy(() => import('src/pages/dashboard/user/account/socials'));
const AccountNotificationsPage = lazy(
  () => import('src/pages/dashboard/user/account/notifications')
);
const AccountChangePasswordPage = lazy(
  () => import('src/pages/dashboard/user/account/change-password')
);
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Event
const EventListPage = lazy(() => import('src/pages/dashboard/event/list'));
const EventDetailsPage = lazy(() => import('src/pages/dashboard/event/details'));
const EventCreatePage = lazy(() => import('src/pages/dashboard/event/new'));
const EventEditPage = lazy(() => import('src/pages/dashboard/event/edit'));
// File manager
// const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
const KanbanSettingsPage = lazy(() => import('src/pages/dashboard/kanban-settings'));
// Blank page
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
// Customer
const CustomerProfilePage = lazy(() => import('src/pages/dashboard/customer/profile'));
const CustomerCardsPage = lazy(() => import('src/pages/dashboard/customer/cards'));
const CustomerListPage = lazy(() => import('src/pages/dashboard/customer/list'));
const CustomerCreatePage = lazy(() => import('src/pages/dashboard/customer/new'));
const CustomerEditPage = lazy(() => import('src/pages/dashboard/customer/edit'));
// System Settings
const SystemSettingsPage = lazy(() => import('src/pages/dashboard/system-settings'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

const accountLayout = () => (
  <AccountLayout>
    <SuspenseOutlet />
  </AccountLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      {
        path: 'user',
        children: [
          { index: true, element: <UserProfilePage /> },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'billing', element: <AccountBillingPage /> },
              { path: 'notifications', element: <AccountNotificationsPage /> },
              { path: 'socials', element: <AccountSocialsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      {
        path: 'customer',
        children: [
          { index: true, element: <CustomerProfilePage /> },
          { path: 'profile', element: <CustomerProfilePage /> },
          { path: 'cards', element: <CustomerCardsPage /> },
          { path: 'list', element: <CustomerListPage /> },
          { path: 'new', element: <CustomerCreatePage /> },
          { path: ':id/edit', element: <CustomerEditPage /> },
        ],
      },
      {
        path: 'event',
        children: [
          { index: true, element: <EventListPage /> },
          { path: 'list', element: <EventListPage /> },
          { path: ':id', element: <EventDetailsPage /> },
          { path: ':id/edit', element: <EventEditPage /> },
          { path: 'new', element: <EventCreatePage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { index: true, element: <InvoiceListPage /> },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { index: true, element: <BlogPostsPage /> },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':id', element: <BlogPostPage /> },
          { path: ':id/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      // { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'kanban-settings', element: <KanbanSettingsPage /> },
      { path: 'blank', element: <BlankPage /> },
      { path: 'system-settings', element: <SystemSettingsPage /> },
    ],
  },
];
