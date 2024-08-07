import { createBrowserRouter } from 'react-router-dom'
import RouterView from './RouterView'
import ErrorPageProviderRouter from './ErrorPageProviderRouter'
import Dashboard from './pages/Dashboard'

export const mainRouter = createBrowserRouter([
    {
        path: '/',
        Component: RouterView,
        ErrorBoundary: ErrorPageProviderRouter,
        children: [
            {
                path: '/',
                Component: Dashboard,
            },
        ],
    },
])
