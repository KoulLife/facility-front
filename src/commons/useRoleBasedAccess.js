import {useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';

// 역할 기반 접근 제어 훅
const useRoleBasedAccess = (allowedRoles) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('role');
        // console.log('Current role:', role); // 역할 출력

        // 허용된 역할이 아닐 경우 메인 페이지로 리다이렉트
        if (!allowedRoles.includes(role)) {
            alert('접속 권한이 없습니다.');
            navigate('/');
        }
    }, [allowedRoles, navigate, location]);
};

export default useRoleBasedAccess;
