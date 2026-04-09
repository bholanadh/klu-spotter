import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const EntryPage = lazy(() => import("@/pages/EntryPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const rootRoute = createRootRoute({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  ),
});

const entryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EntryPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([entryRoute, dashboardRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
