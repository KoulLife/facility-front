import React, {createContext, useContext, useState, useMemo} from 'react';

// Context 생성
export const IsLoginContext = createContext();

export function IsLoginProvider({children}) {
    // 로컬 스토리지에서 토큰 확인하여 초기 로그인 상태 설정
    const [isLogin, setIsLogin] = useState(localStorage.getItem('access_token') != null);
    const [user, setUser] = useState(() => {
        const memberId = localStorage.getItem('memberId');
        const memberNm = localStorage.getItem('memberNm');
        return memberId && memberNm ? {memberId, memberNm} : null;
    });

    // useMemo를 사용하여 props 변경 시에만 컨텍스트 값이 재계산되도록 함
    const value = useMemo(() => ({isLogin, setIsLogin, user, setUser}), [isLogin, user]);

    return (
        <IsLoginContext.Provider value={value}>
            {children}
        </IsLoginContext.Provider>
    );
}

export function useIsLoginState() {
    const context = useContext(IsLoginContext);
    if (!context) {
        throw new Error('useIsLoginState must be used within an IsLoginProvider');
    }
    return context;
}
