import React from "react";
import Welcome from './pages/Home/Home'
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dash from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Postjob from "./pages/PostJob/PostJob";
import JobDetail from "./pages/JobDetail/JobDetail";
import NotFound from "./pages/NotFound/NotFound";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
function App() {



    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={< Login />} />
                <Route path="/signup" element={< Signup />} />
                <Route path="/forgotpassword" element={< ForgotPassword />} />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/post"
                    element={
                        <ProtectedRoute>
                            <Postjob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dash />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/job/:id"
                    element={
                        <ProtectedRoute>
                            <JobDetail />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>

    )
}

export default App