import { ErrorBoundary } from '@zardoy/react-util'
import { RouterProvider } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import { mainRouter } from './Router'
import ErrorDisplay from './ErrorDisplay'
import GlobalModal from './GlobalModal'
import GlobalToast from './GlobalToast'

export default function App() {
    return (
        <ErrorBoundary renderError={err => <ErrorDisplay>{err.message}</ErrorDisplay>}>
            <NextUIProvider>
                <main className="dark">
                    <GlobalToast />
                    <GlobalModal />
                    <Router />
                </main>
            </NextUIProvider>
        </ErrorBoundary>
    )
}

const Router = () => {
    return <RouterProvider router={mainRouter} />
}
