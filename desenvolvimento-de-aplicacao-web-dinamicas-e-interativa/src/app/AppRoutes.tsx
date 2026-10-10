import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { Home } from '../pages/Home';
import { PostDetails } from '../pages/PostDetails';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Admin } from '../pages/Admin';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function AppRoutes(): ReactElement {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="posts/:id" element={<PostDetails />} />
                <Route path="login" element={<Login />} />
                <Route path="cadastro" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="admin" element={<Admin />} />
                </Route>
            </Route>
        </Routes>
    );
}
