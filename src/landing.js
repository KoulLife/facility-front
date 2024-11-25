import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import * as common from './commons/common';
import Login from './screens/login/login';

const LandingPage = () => {
    const [isToken, setIsToken] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const storedRole = localStorage.getItem('role');

            if (accessToken && refreshToken && storedRole) {
                try {
                    // const url = `${common.getApiUrl()}/member`;
                    // const requestData = { phone: '', email: '' };

                    // 토큰 유효성 검사 API
                    // await axios.put(url, requestData, {
                    //     headers: {
                    //         Authorization: `Bearer ${accessToken}`,
                    //         'Content-Type': 'application/json'
                    //     }
                    // });
                    
                    setRole(storedRole);
                } catch (isToken) {
                    setIsToken(true);
                }
            } else {
                setIsToken(true);
            }
        };

        fetchData();
    }, []);

    if (isToken) {
        return <Login />;
    }

    switch (role) {
        case "ADMIN":
            return <Navigate to="/admin/org-management" />;
        case "MANAGE":
            return <Navigate to="/manager/dashboard/facility" />;
        case "CHECKER":
            return <Navigate to="/checker" />;
        default:
            return <Login />;
    }
};

export default LandingPage;