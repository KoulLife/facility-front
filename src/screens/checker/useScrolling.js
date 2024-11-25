import { useEffect, useState } from 'react';

const useScrolling = (threshold = 50) => {
    const [isAtPosition, setIsAtPosition] = useState(false); // 특정 위치에 도달했는지 여부

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleScroll = () => {
                const currScroll = window.pageYOffset;
                setIsAtPosition(currScroll > threshold); // threshold 이상의 위치에 도달했는지 확인
                console.log('현재',currScroll)
            };

            window.addEventListener('scroll', handleScroll, { passive: true });

            return () => {
                window.removeEventListener('scroll', handleScroll, { passive: true });
            };
        }
    }, [threshold]); // threshold가 변경되면 useEffect가 다시 실행됨

    return isAtPosition; // 특정 위치에 도달했는지 여부를 반환
};

export default useScrolling;
