import React, {useState} from 'react';
import {Box, Typography, Button, TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import topLeftLogo from '../../images/uni_logo2.png';
import * as common from '../../commons/common'; // 공통 함수 임포트

export default function CheckerLogin() {
    const navigate = useNavigate();
    const [inputId, setInputId] = useState(''); // 아이디 입력 상태 관리
    const [inputPw, setInputPw] = useState(''); // 비밀번호 입력 상태 관리

    const baseUrl = common.getApiUrl();

    // 아이디 입력 핸들러
    const handleInputId = (e) => {
        setInputId(e.target.value);
    };

    // 비밀번호 입력 핸들러
    const handleInputPw = (e) => {
        setInputPw(e.target.value);
    };

    // 로그인 버튼 클릭 시 실행되는 함수
    const handleLogin = (event) => {
        event.preventDefault();
        axios.post(`${baseUrl}/auth/login`, {
            id: inputId,
            password: inputPw,
        })
            .then(res => {
                const {access_token, refresh_token, role, memberId} = res.data;
                localStorage.clear(); // 기존 로컬 스토리지 데이터 초기화
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                localStorage.setItem('role', role); // 역할 저장
                localStorage.setItem('memberId', memberId);

                if (role === "CHECKER") {
                    navigate('/checker');
                } else {
                    alert('점검자만 로그인할 수 있습니다.');
                }
            })
            .catch(error => {
                common.handleApiError(error);
            });
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#21509E',
            color: 'white',
            position: 'relative',
            fontFamily: 'Noto Sans KR, sans-serif',
            overflow: 'hidden',
            padding: '20px',
        }}>
            {/* 상단 헤더 왼쪽 로고 */}
            <Box sx={{
                position: 'absolute',
                top: '20px',
                left: '20px',
            }}>
                <Box
                    component="img"
                    src={topLeftLogo}
                    alt="Top Left Logo"
                    sx={{
                        maxWidth: '80px',
                        height: 'auto',
                    }}
                />
            </Box>
            {/* 상단 헤더 오른쪽 텍스트 */}
            <Box sx={{
                position: 'absolute',
                top: '30px',
                right: '20px',
                color: 'white',
                fontSize: '0.775rem',
                fontFamily: 'Noto Sans KR, sans-serif',
            }}>
                스마트 시설관리시스템
            </Box>

            {/* 로그인 아이콘 */}
            <Box sx={{
                top: '17%',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'relative',
            }}>
                {/* <Box
                    component="img"
                    src={ManIcon}
                    alt="프로필 이미지"
                    sx={{
                        width: '75px',
                        height: '75px',
                    }}
                /> */}
                <Box sx={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #3876FF',
                }}>
                    {/* <Box
                        component="img"
                        src={CameraIcon}
                        alt="카메라 이미지"
                        sx={{
                            width: '18px',
                            height: '16px',
                        }}
                    /> */}
                </Box>
            </Box>

            {/* 로그인 입력 폼 */}
            <Box sx={{
                position: 'absolute',
                top: '40%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                padding: '0 23px',
                maxWidth: '450px'
            }} component="form" onSubmit={handleLogin} noValidate>
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="username"
                    name="username"
                    label="아이디"
                    autoComplete="off"
                    autoFocus
                    onChange={handleInputId}
                    value={inputId}
                    InputLabelProps={{
                        sx: {
                            transform: 'translate(18px, 15px) scale(1)',
                            '&.MuiInputLabel-shrink': {
                                transform: 'translate(13px, 3px) scale(0.75)',
                            },
                        },
                    }}
                    InputProps={{
                        notched: false,
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '1px',
                            },
                        },
                    }}
                    sx={{
                        marginBottom: '0px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                    }}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="password"
                    type="password"
                    id="password"
                    label="비밀번호"
                    autoComplete="off"
                    onChange={handleInputPw}
                    value={inputPw}
                    InputLabelProps={{
                        sx: {
                            transform: 'translate(18px, 15px) scale(1)',
                            '&.MuiInputLabel-shrink': {
                                transform: 'translate(13px, 3px) scale(0.75)',
                            },
                        },
                    }}
                    InputProps={{
                        notched: false,
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '1px',
                            },
                        },
                    }}
                    sx={{
                        marginBottom: '20px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                    }}
                />


                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                        fontFamily: 'Noto Sans KR, sans-serif',
                        fontSize: '1.0rem',
                        marginTop: '20px',
                        height: '45px',
                        backgroundColor: '#429BE1',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#3a8dc1',
                            boxShadow: 'none',
                        },
                        '&:active': {
                            boxShadow: 'none',
                        }
                    }}
                >
                    로그인
                </Button>

                {/* 하단 텍스트 박스 */}
                <Box sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: '30px',
                    width: '100%'
                }}>
                    <Box sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            flex: 1,
                            height: '1px',
                            backgroundColor: '#4A699E'
                        }}/>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.8rem',
                                fontFamily: 'Noto Sans KR, sans-serif',
                                color: 'white',
                                padding: '0 10px',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/checker/terms-of-use')}
                        >
                            회원가입
                        </Typography>
                        <Box sx={{
                            flex: 1,
                            height: '1px',
                            backgroundColor: '#4A699E'
                        }}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
