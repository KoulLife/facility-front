import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import * as common from './commons/common'

const baseUrl = common.getApiUrl();

// 토큰 만료 확인
function isTokenExpired(token) {
    if (!token) return true;

    try {
        const [, payload] = token.split('.');
        if (!payload) return true;
        
        const decoded = JSON.parse(atob(payload));
        const currentTime = Date.now() / 1000;
        
        return decoded.exp < currentTime; // 토큰 만료 시간(exp)과 현재 시간 비교하여 만료 여부 판단
    } catch (error) {
        console.error("Error decoding token:", error);
        return true; // 디코딩 오류 발생 시 만료 처리해버리기
    }
}

// 토큰 갱신
async function refreshAccessToken(refreshToken) {
    try { 
        const response = await axios.post(`${baseUrl}/auth/refresh-token`, { refreshToken });

        if (response.data !== undefined) {
            const newAccessToken = response.data;
            localStorage.setItem('access_token', response.data);
            return newAccessToken;
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null;
    }
}

function validationAuth(Component) {
    return function AuthenticatedComponent(props) {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
            const newAccessToken = refreshAccessToken(refreshToken);

            if (!newAccessToken || newAccessToken == undefined) {
                return <Navigate to="/login" />;
            }
        } else if (!refreshToken) {
            // console.log('refresh없음')
            return <Navigate to="/" />;
        } else if (!isTokenExpired(accessToken)){
            // console.log('토큰정상')
            return <Component {...props} />;
        }
    };
}

export default validationAuth;