// import React, {useEffect} from 'react';
// import {AppBar, Toolbar, IconButton, Container, Typography, useMediaQuery} from '@mui/material';
// import {useTheme} from '@mui/material/styles';
// import {useLocation, useNavigate} from 'react-router-dom';
// import ExitToAppIcon from '@mui/icons-material/ExitToApp';
// import uniLogo from '../images/uni_logo.png';
// import {useIsLoginState} from './IsLoginContext';
// import axios from 'axios';
// import * as common from '../commons/common';

// function Header({children}) {


//     let headerText = "관리자 페이지";  // 기본 헤더 텍스트 설정
//     if (location.pathname === "/login" || location.pathname === "/") {
//         headerText = "";  // 로그인 페이지와 홈에서는 헤더 텍스트를 보여주지 않음
//     }
//     if (location.pathname === "/sign-up" || location.pathname === "/") {
//         headerText = "";  // 회원가입 페이지와 홈에서는 헤더 텍스트를 보여주지 않음
//     }
//     if (location.pathname.startsWith("/admin")) {
//         headerText = "통합관리자 페이지";  // 통합관리자 페이지에서는 헤더 텍스트를 변경
//     }

//     const handleLogoClick = (event) => {
//         event.preventDefault(); // 기본 동작을 막음.
//         if (location.pathname === "/") {
//             // 로그인 페이지에서는 아무 동작도 하지 않음
//             return;
//         }
//         if (location.pathname.startsWith("/admin")) {
//             // 통합관리자 페이지에서는 새로고침만 함
//             window.location.reload();
//             return;
//         }
//         if (!isLogin) {
//             alert('로그인 후 이용 가능합니다.');
//         } else {
//             navigate('/manager/'); // 로그인 상태면 대시보드로 이동
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             await axios.post(`${baseUrl}/auth/logout`, {}, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//                 }
//             });
//             localStorage.removeItem('access_token');
//             localStorage.removeItem('refresh_token');
//             navigate('/');
//         } catch (error) {
//             console.error('Logout error:', error);
//         }
//     };

//     return (
//         <AppBar position="static">
//             <Container maxWidth="lg" style={{maxWidth: '1500px'}}>
//                 <Toolbar style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//                     <div style={{display: 'flex', alignItems: 'center'}}>
//                         {location.pathname.startsWith('/admin') && isMobile && (
//                             <div>{children}</div>
//                         )}
//                         <button
//                             onClick={handleLogoClick}
//                             style={{border: 'none', background: 'none', padding: 0, cursor: 'pointer'}}
//                         >
//                             <img src={uniLogo} alt="unicheck logo" style={{width: '100px'}}/>
//                         </button>
//                         {headerText && (
//                             <Typography
//                                 variant="h6"
//                                 color="inherit"
//                                 noWrap
//                                 style={{marginLeft: '20px'}}
//                                 sx={{fontWeight: 'bold'}}
//                             >
//                                 {headerText}
//                             </Typography>
//                         )}
//                     </div>
//                     {isLogin &&
//                         location.pathname !== '/login' &&
//                         location.pathname !== '/' &&
//                         location.pathname !== '/sign-up' && (
//                             <IconButton onClick={handleLogout} color="inherit">
//                                 <ExitToAppIcon/>
//                             </IconButton>
//                         )}
//                 </Toolbar>
//             </Container>
//         </AppBar>
//     );
// }

// export default Header;