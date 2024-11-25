import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import coatOfArms from '../../../images/CoatOfArms_KyungHeeUniversity.png'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import axios from 'axios';
import * as common from '../../../commons/common';

export default function SafetyIntro() {
    const navigate = useNavigate();
    const { noticeId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/qr/notice/${noticeId}`, {
                    headers: {'Content-Type': 'application/json'}
                });
                if (!response.data) {
                    navigate(`/safetyIntro`);
                }
            } catch (error) {
                navigate(`/safetyIntro`);
            }
        };

        fetchData();
    }, []);

    const handleEnter = () => {
        navigate(`/safetyCheckForm/${noticeId}`);
    };

    return (
        <Box sx={{
            height: '100vh',
            bgcolor: 'var(--main-white-color)',
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
                height: '100%',
            }}>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexGrow: 2.5
                }}>
                    <Typography variant='subtitle2' sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        공연장 안전수칙 동영상 시청
                    </Typography>
                    <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                        안전한 공연 환경을 위해<br />
                        안전수칙 동영상을 시청하시고,<br />
                        시청 완료 후 교육이수를<br />
                        확인해주세요.<br />
                    </Typography>
                </Box>
                <Box sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 2
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
                        시청하기
                        <PlayCircleFilledIcon sx={{ marginLeft: '10px' }} />
                    </Button>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <img
                        src={coatOfArms}
                        alt="경희대학교"
                        style={{
                            width: '170px',
                            aspectRatio: '1', // 정사각형 비율 유지
                            objectFit: 'contain', // 이미지 비율 유지
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}