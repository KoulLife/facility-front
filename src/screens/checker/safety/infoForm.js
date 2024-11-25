import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../../commons/common';

export default function SafetyCheckForm() {
    const navigate = useNavigate();
    const { noticeId } = useParams();

    const [formData, setFormData] = useState({
        organizationNm: '',
        name: '',
        ssn: ''
    });
    const [formAlert, setAlert] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/qr/notice/${noticeId}`, {
                    headers: {
                        // Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.data) {
                    navigate(`/safetyIntro`);
                }
            } catch (error) {
                navigate(`/safetyIntro`);
            }
        };
        fetchData();
    })

    const handleNumberChange = (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9]/g, ''); // 숫자만 남기고 나머지 문자 제거
        if (numericValue.length <= 6) {
            setFormData({ ...formData, ssn: numericValue });
        }
    };

    const handleEnter = () => {
        if (!formData.organizationNm) {
            setAlert('소속을 입력해주세요');
            return;
        } else if (!formData.name) {
            setAlert('이름을 입력해주세요');
            return;
        } else if (!formData.ssn || formData.ssn.length !== 6) {
            setAlert('주민등록번호 앞 6자리를 정확히 입력해주세요');
            return;
        } else {
            setAlert('');
            navigate(`/safetyGuide/${noticeId}`, { state: formData });
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            bgcolor: 'var(--main-white-color)',
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0 20px',
                justifyContent: 'center',
                height: '100%',
            }}>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '30px'
                }}>
                    <Typography variant='subtitle2' sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        공연장 안전수칙 교육이수 확인
                    </Typography>
                    <Typography variant='h6' sx={{ marginBottom: '10px', fontWeight: 'bold' }}>
                        공연장 안전수칙 교육이수 확인을 위해<br />
                        소속, 이름, 주민등록번호 앞자리를<br />
                        입력해주세요.<br />
                    </Typography>
                    <Typography variant='caption'>
                        입력하신 정보는 이수 확인 용도로만 사용되며<br />
                        안전하게 관리됩니다.
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '50px'
                }}>
                    <Box sx={{ marginBottom: '12px', width: '100%' }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            소속 *
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            autoComplete='off'
                            value={formData.organizationNm}
                            onChange={(e) => setFormData({ ...formData, organizationNm: e.target.value })}
                            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #fff' } }}
                            sx={{
                                input: { padding: '10px 15px' },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    border: 'none',
                                }
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: '12px', width: '100%' }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            이름 *
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            autoComplete='off'
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #fff' } }}
                            sx={{
                                input: { padding: '10px 15px' },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    border: 'none',
                                }
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: '12px', width: '100%' }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            주민등록번호 앞 6자리 *
                        </Typography>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <TextField
                                variant="outlined"
                                autoComplete='off'
                                type='text'
                                inputMode='numeric'
                                value={formData.ssn}
                                onChange={(e) => handleNumberChange(e)}
                                InputProps={{ style: { borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #fff' } }}
                                sx={{
                                    width: '130px',
                                    input: { padding: '10px 15px' },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: 'none',
                                    }
                                }}
                            />
                            <Typography sx={{ display: 'flex', alignItems: 'center' }}>-</Typography>
                            <TextField
                                disabled
                                variant="outlined"
                                value="●●●●●●●"
                                InputProps={{ style: { borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #fff' } }}
                                sx={{
                                    width: '130px',
                                    input: { padding: '10px 15px' },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: 'none',
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                    {formAlert && (
                        <Alert severity="warning">
                            {formAlert}
                        </Alert>
                    )}
                </Box>
                <Box sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Button
                        variant="contained"
                        onClick={handleEnter}
                        sx={{
                            backgroundColor: 'var(--main-blue-color)',
                            padding: '7px 35px',
                            fontSize: '1.4rem',
                            borderRadius: '30px',
                            boxShadow: 'none',
                        }}
                    >
                        작성완료
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}