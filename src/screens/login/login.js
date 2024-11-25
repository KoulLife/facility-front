import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { Alert, Typography } from '@mui/material';
import axios from "axios";
import { IsLoginContext } from "../../components/IsLoginContext";
import * as common from '../../commons/common';
import uniLogo from '../../../src/images/UNI_LOGO_BLUE.png';

export default function Login() {
    const {setUser, setIsLogin } = useContext(IsLoginContext);
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [inputId, setInputId] = useState('');
    const [inputPw, setInputPw] = useState('');

    const baseUrl = common.getApiUrl();

    // 로그인 처리
    const handleLogin = (event) => {
        event.preventDefault();
        axios.post(`${baseUrl}/auth/login`, { id: inputId, password: inputPw })
            .then(res => {
                const { access_token, refresh_token, role, memberId } = res.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                localStorage.setItem('role', role);
                localStorage.setItem('memberId', memberId);
                setIsLogin(true);

                fetchMemberName(access_token, role);
            })
            .catch(error => {
                setError(`${error.response ? error.response.data.message : error.message}`);
            });
    };

    // 사용자 이름 localStorage에 저장하고 리다이렉션
    const fetchMemberName = (accessToken, role) => {
        axios.get(`${baseUrl}/member/${inputId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => {
                const { memberNm } = response.data;
                localStorage.setItem('memberNm', memberNm);
                setUser(prev => ({ ...prev, memberNm }));

                // 사용자 리다이렉션
                redirectUser(role);
            })
            .catch(error => {
                console.error('Error fetching member name:', error);
            });
    };

    const redirectUser = (role) => {
        if (role === "CHECKER") {
            navigate('/checker');
        } else if (role === "ADMIN") {
            navigate('/admin');
        } else if (role === "MANAGE") {
            navigate('/manager');
        }
    };

    const handleInputId = (e) => {
        setError('');
        setInputId(e.target.value);
    };

    const handleInputPw = (e) => {
        setError('');
        setInputPw(e.target.value);
    };

    return (
        <>
            <Box sx={{ height: '100vh', bgcolor: 'var(--main-white-color)' }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'coulumn', justifyContent: 'center', alignItems: 'center' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: { xs: 'calc(100% - 60px)', sm: '730px' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                boxSizing: 'border-box',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: { xs: '100%', sm: '50%' }
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Box component="img"
                                        src={uniLogo}
                                        sx={{
                                            maxWidth: { xs: '130px', sm: '155px' },
                                            marginBottom: '30px'
                                        }}>
                                    </Box>
                                </Box>
                                <Typography>유니체크에 오신것을 환영합니다 !</Typography>
                                <Box component="form" onSubmit={handleLogin} noValidate autoComplete="off"
                                    sx={{ width: '100%' }}>
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
                                        value={inputId || ''}
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
                                        value={inputPw || ''}
                                        sx={{
                                            backgroundColor: 'white',
                                            borderRadius: '10px',
                                        }}
                                    />
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        fullWidth
                                        sx={{
                                            fontSize: '1.0rem',
                                            marginTop: '10px',
                                            height: { xs: '45px', sm: '50px' },
                                            backgroundColor: 'var(--main-blue-color)',
                                            '&:hover': { backgroundColor: 'var(--main-blue-color)' }
                                        }}
                                    >
                                        로그인
                                    </Button>
                                </Box>
                                <Link href="/sign-up" sx={{ alignSelf: 'flex-start', marginTop: '15px', fontSize: '12px', color: '#000', textDecoration: 'underline' }}>
                                    {"회원가입"}
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}