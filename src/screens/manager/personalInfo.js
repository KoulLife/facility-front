import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Paper, Button, IconButton, Divider
} from '@mui/material';
import validationAuth from '../../validationAuth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useIsLoginState } from '../../components/IsLoginContext';
import * as common from '../../commons/common';
import { styled } from '@mui/material/styles';
import AlertForConfirm from '../../components/alertForConfirm';

function PersonalInfo() {
    const navigate = useNavigate();
    const { user, setIsLogin } = useIsLoginState();
    const [userData, setUserData] = useState();
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            const memberId = localStorage.getItem('memberId');
            if (memberId) {
                try {
                    const url = `${common.getApiUrl()}/member/${memberId}`;
                    const accessToken = localStorage.getItem('access_token');
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    if (response.data) {
                        setUserData(response.data);
                    }
                } catch (error) {
                    // common.handleApiError(error);
                    alert('사용자 정보를 불러올 수 없습니다.')
                    navigate('/')
                }
            }
        };

        fetchUserData();
    }, []);

    const handleLogoutClick = () => {
        setIsLogoutAlertOpen(true);
    };

    const handleClose = () => {
        setIsLogoutAlertOpen(false);
    };

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        // console.log('Logout initiated');
        setIsLogoutAlertOpen(false);
        const url = `${common.getApiUrl()}/auth/logout`;
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log('Logout successful', response);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsLogin(false);
            navigate('/', { replace: true });
        } catch (error) {
            common.handleApiError(error);
        }
    };

    useEffect(() => {
        console.log('Effect to check logout');
    }, [navigate, setIsLogin]);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    const StyledTypography = styled(Typography)(({ theme }) => ({
        fontSize: '1rem',
        fontWeight: 'bold',
    }));

    const StyledDivider = styled(Divider)(({ theme }) => ({
        marginY: theme.spacing(1),
        borderBottomWidth: 1,
    }));

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '10px 20px',
                backgroundColor: 'var(--sub-darkblue-color)',
                color: 'white',
                minHeight: 65,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleGoBack}>
                    <IconButton sx={{ color: 'white', padding: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.2rem' }}></Typography>
                </Box>
            </Box>
            {/* 하단 박스 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: 'var(--main-blue-color)',
                height: '130px',
                minHeight: '100px',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '50%',
                    backgroundColor: 'var(--main-white-color)',
                    width: '70px',
                    height: '70px',
                    marginBottom: '10px',
                }}>
                </Box>
                <Typography variant="body2" sx={{
                    fontSize: '1.0rem',
                    color: 'white',
                    textAlign: 'center',
                }}>
                    {userData.memberNm} 님
                </Typography>
            </Box>

            <Box sx={{ p: 2, flexGrow: 1 }}>
                <Paper sx={{ p: 2, mb: 2, boxShadow: 'none', backgroundColor: 'var(--main-white-color)' }}>
                    <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                        <Grid item xs={3}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'normal' }}>이름</StyledTypography>
                        </Grid>
                        <Grid item xs={9}>
                            <StyledTypography variant="body1">{userData.memberNm}</StyledTypography>
                        </Grid>
                    </Grid>
                    <StyledDivider />
                    <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                        <Grid item xs={3}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'normal' }}>휴대폰</StyledTypography>
                        </Grid>
                        <Grid item xs={9}>
                            <StyledTypography variant="body1">{userData.phone}</StyledTypography>
                        </Grid>
                    </Grid>
                    <StyledDivider />
                    <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                        < Grid item xs={3}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'normal' }}>이메일</StyledTypography>
                        </Grid>
                        <Grid item xs={9}>
                            <StyledTypography variant="body1">{userData.email}</StyledTypography>
                        </Grid>
                    </Grid>
                    <StyledDivider />
                    <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                        <Grid item xs={3}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'normal' }}>소속</StyledTypography>
                        </Grid>
                        <Grid item xs={9}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {userData.dept[0] ? userData.dept[0].deptNm : ''}
                                {userData.dept[1] ? ` - ${userData.dept[1].deptNm}` : ''}
                                {userData.dept[2] ? ` - ${userData.dept[2].deptNm}` : ''}
                            </StyledTypography>
                        </Grid>
                    </Grid>
                    <StyledDivider />
                    <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                        <Grid item xs={3}>
                            <StyledTypography variant="body1" sx={{ fontWeight: 'normal' }}>직위</StyledTypography>
                        </Grid>
                        <Grid item xs={9}>
                            <StyledTypography variant="body1">{userData.position}</StyledTypography>
                        </Grid>
                    </Grid>
                </Paper>
                <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ mb: 2, mt: 3, }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogoutClick}
                        sx={{
                            backgroundColor: 'var(--main-blue-color)',
                            borderRadius: '50px',
                            width: '10rem',
                            height: '2rem',
                            fontSize: '1rem',
                            paddingX: '20px',
                            paddingY: '10px',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'var(--main-blue-color)',
                                boxShadow: 'none',
                            },
                            '&:active': {
                                boxShadow: 'none',
                            }
                        }}
                    >
                        로그아웃
                    </Button>
                    <AlertForConfirm
                        open={isLogoutAlertOpen}
                        onClose={handleClose}
                        onConfirm={handleLogout}
                        contentText="로그아웃 하시겠습니까?"
                    />
                    <Typography variant="body2" sx={{
                        fontSize: '0.8rem',
                        color: '#777',
                        marginTop: '10px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        mt: 5,
                    }}>
                    </Typography>
                </Grid>
            </Box>
        </Box>
    );
}

export default validationAuth(PersonalInfo);