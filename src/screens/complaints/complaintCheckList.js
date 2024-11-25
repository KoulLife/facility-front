import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Grid, Table, TableBody, TableCell, Divider,
    TableContainer, TableHead, TableRow, IconButton,
    Button
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { useNavigate, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import '../../App.css';
import * as common from '../../commons/common';

//민원인 페이지 - 점검기록 조회
export default function ComplaintCheckList() {
    const navigate = useNavigate();
    const { facilityId } = useParams();
    const [checkRslt, setCheckRslt] = useState([]);
    const [activeStep, setActiveStep] = useState(0); // Carousel activeStep 상태 추가

    useEffect(() => {
        fetchData();
    }, []);

    // 점검 데이터 가져오기
    const fetchData = async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/qr/result/${facilityId}`);
            console.log(response.data.checkRslt)
            setCheckRslt(response.data.checkRslt ?? []);
        } catch (error) {
            common.handleApiError(error);
        }
    };

    const handleRecent = () => {
        setActiveStep(0); // 첫 번째 슬라이드로 이동
    }

    const handleStepChange = (step) => {
        setActiveStep(step);
    };

    const handleNaviBack = () => {
        navigate(`/complaint-input/${facilityId}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--main-white-color)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '70px', padding: '10px 20px', backgroundColor: 'var(--main-blue-color)', color: 'white' }}>
                <Box sx={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '15px', padding: '0 10px 0 4px' }}
                    onClick={handleNaviBack}>
                    <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>이전</Typography>
                </Box>
            </Box>
            {checkRslt.length > 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: '100%', height: '130px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', color: 'var(--main-blue-color)' }}>
                        <Typography variant="body2" sx={{ fontSize: '1.0rem', fontWeight: 'bold' }}>
                            {checkRslt[0].groupNm}
                        </Typography>
                        <Typography variant="h4" sx={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {checkRslt[0].facilityNm}
                        </Typography>
                    </Box>
                </Box>
            ) : (null)}
            <Divider />
            <Box sx={{ heght: '100%' }}>
                {checkRslt.length > 0 ? (
                    <Carousel
                        indicators={false}
                        autoPlay={false}
                        animation={false}
                        navButtonsAlwaysVisible={checkRslt.length > 0}
                        index={activeStep}
                        onChange={handleStepChange}
                    >
                        {checkRslt.map((record, index) => (
                            <Box key={index}>
                                <Box sx={{ margin: '20px 10px 10px 10px', padding: '10px', backgroundColor: 'white', boxShadow: 'none' }}>
                                    <Grid container spacing={0} alignItems='center'>
                                        <Grid item xs={2}>
                                            <Typography variant="body1" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                                <span>점검일시</span>
                                                <span style={{ padding: '0 5px' }}>:</span>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} >
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'black' }}>
                                                {record.checkTime}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button variant="outlined" onClick={handleRecent} sx={{ fontSize: '0.7rem' }}>최근 기록 보기</Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box sx={{ margin: '0px 10px', padding: '5px', backgroundColor: 'white', boxShadow: 'none', boxSizing: 'border-box' }}>
                                    <TableContainer sx={{ paddingBottom: '10px', minHeight: '500px' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ minHeight: '56px' }}>
                                                    <TableCell sx={{ bgcolor: '#e0e0e0' }}>점검항목</TableCell>
                                                    <TableCell sx={{ bgcolor: '#e0e0e0' }}>세부항목</TableCell>
                                                    <TableCell sx={{ bgcolor: '#e0e0e0' }}>점검상태</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {record.checkType.map((type, typeIndex) => (
                                                    type.checkRsltDtlList.map((detail, detailIndex) => (
                                                        <TableRow key={`${detail.checkItemId}-${typeIndex}-${detailIndex}`}>
                                                            {detailIndex === 0 && (
                                                                <TableCell rowSpan={type.checkRsltDtlList.length}>
                                                                    {type.checkTypeNm}
                                                                </TableCell>
                                                            )}
                                                            <TableCell>{detail.checkItemNm}</TableCell>
                                                            <TableCell>{detail.checkRsltValNm}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Box>
                        ))}
                    </Carousel>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', height: '400px', alignItems: 'center' }}>
                        <Typography>점검 기록이 없습니다.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}