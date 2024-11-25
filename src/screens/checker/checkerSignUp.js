import React, {useState, useEffect} from 'react';
import {Box, Grid, Typography, Paper, Button, IconButton, Divider, TextField} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import * as common from '../../commons/common';

function CheckerSignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        memberId: '',
        password: '',
        memberNm: '',
        email: '',
        phone: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleClick = () => {
        document.getElementById('fileInput').click();
    };

    // 회원가입 처리 함수
    const handleSignUp = async (event) => {
        event.preventDefault();
        if (formData.password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        const payload = new FormData();

        const registerRequest = {
            memberId: formData.memberId,
            password: formData.password,
            memberNm: formData.memberNm,
            email: formData.email,
            phone: formData.phone.replace(/-/g, ''),  // phone 값에서 "-" 제거
        };

        payload.append('registerRequest', new Blob([JSON.stringify(registerRequest)], {type: "application/json"}));

        if (selectedImage) {
            payload.append('profileImage', selectedImage);
        }

        try {
            const response = await axios.post(`${common.getApiUrl()}/auth/register`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert("회원가입이 완료되었습니다.");
            navigate('/checker-login');
        } catch (error) {
            common.handleApiError(error);
            alert(`회원가입 중 오류가 발생했습니다: ${error.response ? error.response.data.message : error.message}`);
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
                backgroundColor: '#21509E',
                color: 'white',
                minHeight: 65,
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={handleGoBack}>
                    <IconButton sx={{color: 'white', padding: '1px'}}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <Typography sx={{fontSize: '1.2rem'}}>회원가입</Typography>
                </Box>
            </Box>

            {/* 하단 박스 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: '#154390',
                height: '130px',
                minHeight: '100px',
                fontFamily: 'Noto Sans KR, sans-serif',
                position: 'relative',
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        width: '70px',
                        height: '70px',
                        marginBottom: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                    onClick={handleClick}
                >
                    <input
                        type="file"
                        id="fileInput"
                        style={{display: 'none'}}
                        onChange={handleImageChange}
                    />
                    {/* <Box
                        component="img"
                        src={imagePreview}
                        alt="프로필 이미지"
                        sx={{
                            maxWidth: '45px',
                            height: 'auto',
                        }}
                    /> */}
                    <Box sx={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #3876FF',
                    }}>
                        {/* <Box
                            component="img"
                            src={cameraIcon}
                            alt="카메라 이미지"
                            sx={{
                                width: '18px',
                                height: '16px',
                            }}
                        /> */}
                    </Box>
                </Box>
                <Typography variant="body2" sx={{
                    fontSize: '1.0rem',
                    color: 'white',
                    textAlign: 'center',
                    fontFamily: 'Noto Sans KR, sans-serif'
                }}>
                    프로필 사진
                </Typography>
            </Box>

            <Box sx={{p: 2, flexGrow: 1}}>
                <Paper sx={{p: 2, mb: 2, boxShadow: 'none'}}>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>이름</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="memberNm"
                                value={formData.memberNm}
                                onChange={handleChange}
                                autoComplete="off"
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{my: 1, borderBottomWidth: 1}}/>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>아이디</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="memberId"
                                value={formData.memberId}
                                autoComplete="off"
                                onChange={handleChange}
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{my: 1, borderBottomWidth: 1}}/>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>휴대폰</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="off"
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{my: 1, borderBottomWidth: 1}}/>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>이메일</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{my: 1, borderBottomWidth: 1}}/>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>비밀번호</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="password"
                                type="password"
                                value={formData.password}
                                autoComplete="off"
                                onChange={handleChange}
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{my: 1, borderBottomWidth: 1}}/>
                    <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
                        <Grid item xs={3}>
                            <Typography variant="body1" sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>비밀번호 확인</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                name="confirmPassword"
                                type="password"
                                autoComplete="off"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                variant="outlined"
                                sx={{

                                    '& .MuiOutlinedInput-root': {
                                        height: '30px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container direction="column" justifyContent="center" alignItems="center" sx={{mb: 2, mt: 4,}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSignUp}
                        sx={{
                            backgroundColor: '#21509E',
                            borderRadius: '50px',
                            width: '10rem',
                            height: '2rem',
                            fontFamily: 'Noto Sans KR, sans-serif',
                            fontSize: '1rem',
                            paddingX: '20px',
                            paddingY: '10px',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#1B3A73',
                                boxShadow: 'none',
                            },
                            '&:active': {
                                boxShadow: 'none',
                            }
                        }}
                    >
                        회원가입
                    </Button>
                </Grid>
            </Box>
        </Box>
    );
}

export default CheckerSignUp;
