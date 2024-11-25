import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { Box, Typography, Button } from '@mui/material';
// import axios from 'axios';
// import UniLogo from '../../images/UNI_LOGO_WHITE.png';
// import * as common from '../../commons/common';

export default function ComplaintIntro() {
    const navigate = useNavigate();
    const { facilityId } = useParams();
    // const [facilityName, setFacilityName] = useState('');
    // const [groupNm, setGroupNm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(`/complaint-input/${facilityId}`);
        }, 0); // intro 화면 필요없음

        // // 시설명 가져오기
        // const fetchFacilityData = async () => {
        //     const url = `${common.getApiUrl()}/qr/${facilityId}`;
        //     try {
        //         const response = await axios.get(url, {
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });

        //         if (response.data) {
        //             setFacilityName(response.data.facilityNm);
        //             setGroupNm(response.data.groupNm);
        //         }
        //     } catch (error) {
        //         common.handleApiError(error);
        //     }
        // };

        // fetchFacilityData();
        // return () => clearTimeout(timer);
    }, [facilityId, navigate]);

    const handleEnter = () => {
        navigate(`/complaint-input/${facilityId}`);
    };

    return (
        <>
            {/* <Box sx={{ position: 'fixed', top: 0, left: 0, height: '70px', padding: '10px 20px', width: '100%', bgcolor:'var(--main-blue-color)' }}>
                <Box component="img" src={UniLogo} alt="유니체크" sx={{ width: '80px', height: 'auto', }}/>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                padding: '120px 0',
                bgcolor :'var(--main-white-color)'
            }}>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom :'55px'
                }}>
                    <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 'bold',marginBottom:'20px' }}>
                        {groupNm}
                    </Typography>
                    <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 'bold',marginBottom:'20px' }}>
                        {facilityName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--main-blue-color)'}}>
                        민원접수
                    </Typography>
                </Box>
                <Box
                    component="img"
                    src={uni_illustration}
                    alt="중앙 이미지"
                    sx={{
                        width: { xs: '60%', sm: '40%', md: '25%' },
                        height: 'auto',
                        aspectRatio: '1', // 정사각형 비율 유지
                        objectFit: 'contain', // 이미지 비율 유지
                        marginBottom :'55px'
                    }}
                />
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
                            padding: '10px 20px',
                            fontSize: '1.3rem',
                            borderRadius: '30px',
                            width: '12rem',
                            height: '2.7rem',
                            boxShadow: 'none',
                        }}
                    >
                        들어가기
                    </Button>
                </Box>
            </Box> */}
        </>
    );
}