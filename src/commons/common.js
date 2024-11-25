// API 기본 URL을 반환하는 함수
export const getApiUrl = () => {
    return `https://unicheck.dsti.co.kr/api`;
    // return `http://43.202.43.42:8080/api`;
    // return `http://localhost:8080/api`;
    // return `http://54.180.48.141/api`;
}

// 이미지 기본 URL을 반환하는 함수
export const getImageBaseUrl = () => {
    return `https://unicheck.dsti.co.kr`;
    // return `http://43.202.43.42:8080`;
    // return `http://localhost:8080`;
    // return `http://54.180.48.141`;
}

// API가 아닌 기본 URL을 반환하는 함수
export const getNoApiBaseUrl = () => {
    return `https://unicheck.dsti.co.kr`;
    // return `http://43.202.43.42:8080`;
    // return `http://localhost:8080`;
    // return `http://54.180.48.141`;
}

// 백엔드에서 보내는 에러 메시지 알림내용 표시
export const handleApiError = (error) => {
    if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
    }
};
