import {createTheme} from '@mui/material/styles';
import {grey, blue} from '@mui/material/colors';

export const theme = createTheme({
    palette: {
        primary: {
            main: blue['600'],
            second: grey['100']
        },
        secondary: {
            main: "#edf2ff"
        },
        error: {
            main: "#DA1E28"
        }
    },
    typography: {
        fontFamily: ['Pretendard-Regular','"Apple Color Emoji"', "Noto Sans KR"].join(",")
    },
    maxWidth: {
        sm: 600, // 작은 화면 (스마트폰)의 최대 너비
        md: 960, // 중간 화면 (태블릿)의 최대 너비
        lg: 1280, // 큰 화면 (데스크탑)의 최대 너비
        xl: 1800, // custom 너비
        xll: 1920, // 매우 큰 화면의 최대 너비
    },
    // maxWidth: '800px', // 최대 너비를 원하는 값으로 설정
    width: '100%', // 최대 너비를 넘어가면 자동으로 조정되도록 설정
    margin: '0 auto', // 가운데 정렬을 위해 margin auto 설정
    padding: '0', // 선택적인 패딩 설정
    boxSizing: 'border-box', // 패딩이 너비에 포함되도록 box-sizing 설정
});
