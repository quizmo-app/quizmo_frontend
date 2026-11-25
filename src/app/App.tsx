import { useMemo } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { LoginPage } from '@/features/auth/ui/LoginPage'
import { PresentationPage } from '@/features/course-presentation/ui/PresentationPage'
import { DashboardPage } from '@/features/courses/ui/DashboardPage'
import { paths } from '@/shared/routing/paths'
import { createDependencies, type Dependencies } from './di/container'
import { MockDevPanel } from './MockDevPanel'

/**
 * Composition root : instancie les adaptateurs (mock ou HTTP) et les injecte
 * dans les pages des fonctionnalités, qui ne connaissent que les ports du domaine.
 */
export function App() {
  const dependencies = useMemo(createDependencies, [])
  const router = useMemo(() => createAppRouter(dependencies), [dependencies])
  return <RouterProvider router={router} />
}

function createAppRouter({ courseRepository, presentationRepository, sessionGateway, devTools }: Dependencies) {
  return createBrowserRouter([
    { path: '/', element: <Navigate to={paths.dashboard} replace /> },
    {
      path: paths.dashboard,
      element: (
        <DashboardPage
          repository={courseRepository}
          footer={devTools ? (reload) => <MockDevPanel devTools={devTools} onDataChanged={reload} /> : undefined}
        />
      ),
    },
    { path: '/cours/:courseId/presenter', element: <PresentationPage repository={presentationRepository} /> },
    { path: '/connexion', element: <LoginPage gateway={sessionGateway} /> },
    { path: '*', element: <Navigate to={paths.dashboard} replace /> },
  ])
}
