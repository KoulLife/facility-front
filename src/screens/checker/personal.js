import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import {
    Box, Grid, Typography, Paper, Avatar, Button, IconButton, Divider
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useIsLoginState } from '../../components/IsLoginContext';
import * as common from '../../commons/common';

function PersonalPage() {
    const navigate = useNavigate();
    const { user, setIsLogin } = useIsLoginState();
    const [userData, setUserData] = useState(null);

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            const memberId = localStorage.getItem('memberId');
            console.log(memberId)
            if (memberId) {
                try {
                    const url = `${common.getApiUrl()}/member/${memberId}`;
                    const accessToken = localStorage.getItem('access_token');
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    setUserData(response.data);
                    if (!response) {
                        if(window.confirm('오류가 발생하였습니다. 로그인 화면으로 이동합니다.')){
                            navigate('/', { replace: true });
                        } else {
                            navigate('/', { replace: true });
                        }
                    }
                } catch (error) {
                    common.handleApiError(error);
                }
            }
        };

        fetchUserData();
    }, []);

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        const url = `${common.getApiUrl()}/auth/logout`;
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            localStorage.clear()
            setIsLogin(false);
            navigate('/', { replace: true });
        } catch (error) {
            common.handleApiError(error);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            {/* 상단헤더 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '10px 20px',
                backgroundColor: 'var(--main-blue-color)',
                color: 'white',
                minHeight: 65,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleGoBack}>
                    <IconButton sx={{ color: 'white', padding: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Box>
            </Box>
            {/* 하단 박스 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: 'var(--sub-darkblue-color)',
                height: '130px',
                minHeight: '100px',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    width: '70px',
                    height: '70px',
                    marginBottom: '10px',
                }}>
                </Box>
                <Typography variant="body2" sx={{
                    fontSize: '1.0rem',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                }}>
                    {userData ?  userData.memberNm : ''} 님
                </Typography>
            </Box>

            <Box sx={{ p: 2, flexGrow: 1 }}>
                {userData ? (
                    <Paper sx={{ p: 2, mb: 2, boxShadow: 'none' }}>
                        <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                            <Grid item xs={3}>
                                <Typography variant="body1" sx={{ fontSize: '0.8rem' }}>휴대폰</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>{userData.phone}</Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 1, borderBottomWidth: 1 }} />
                        <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                            < Grid item xs={3}>
                                <Typography variant="body1" sx={{
                                    fontSize: '0.8rem'
                                }}>이메일</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>{userData.email || ''}</Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 1, borderBottomWidth: 1 }} />
                        <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                            <Grid item xs={3}>
                                <Typography variant="body1" sx={{
                                    fontSize: '0.8rem'
                                }}>소속</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                    {userData.dept[0].deptNm} - {userData.dept[1].deptNm} - {userData.dept[2].deptNm}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 1, borderBottomWidth: 1 }} />
                        <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                            <Grid item xs={3}>
                                <Typography variant="body1" sx={{
                                    fontSize: '0.8rem'
                                }}>직위</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>{userData.position}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                ) : (<Box>
                    정보가 없습니다.</Box>)}
                <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ mb: 2, mt: 3, }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogout}
                        sx={{
                            backgroundColor: 'var(--main-blue-color)',
                            borderRadius: '50px',
                            width: '10rem',
                            height: '2rem',
                            fontSize: '1rem',
                            paddingX: '20px',
                            paddingY: '10px',
                            boxShadow: 'none',
                        }}
                    >
                        로그아웃
                    </Button>
                </Grid>
            </Box>
        </Box>
    );
}

export default validationAuth(PersonalPage);