import {useEffect, useContext} from 'react';
import axios from 'axios';
import {IsLoginContext} from '../components/IsLoginContext';
import {useNavigate} from 'react-router-dom';

// 토큰 만료 시 자동 로그아웃 처리 훅
export default function useAutoLogoutOnTokenExpire() {
    const {setIsLogin} = useContext(IsLoginContext);
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                // 401 또는 400 에러 시 로그아웃 처리
                if (error.response && (error.response.status === 401 || error.response.status === 400)) {
                    localStorage.clear();
                    setIsLogin(false);
                    window.alert("토큰이 만료되어 자동으로 로그아웃 되었습니다.");
                    navigate('/');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate, setIsLogin]);

    return null;
}
