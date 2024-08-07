import { Outlet } from 'react-router-dom'

export default function RouterView() {
    return (
        <div className="px-2 sm:px-4 mt-8 sm:mt-12">
            <Outlet />
        </div>
    )
}
