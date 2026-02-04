import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AtlasPage } from "../features/atlas/pages/AtlasPage";
import { RepoPage } from "../features/repo/pages/RepoPage";

function LayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const router = createBrowserRouter([
  {
    element: <LayoutRoute />,
    children: [
      { path: "/", element: <AtlasPage /> },
      { path: "/repo/:fullName", element: <RepoPage /> },
    ],
  },
]);
