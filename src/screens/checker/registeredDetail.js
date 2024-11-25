import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import {
    Container, Table, TableBody, TableCell, TableRow, Paper, Box, Typography, Grid,
    IconButton, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogContent, DialogTitle, TableContainer,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { format, getMonth, setMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../commons/common';

function CustomCalendar({ value, onChange, abnormalDates }) {
    const [currentDate, setCurrentDate] = useState(value);

    const renderHeader = () => {
        const dateFormat = 'yyyy년 MM월';

        return (
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <IconButton
                    aria-label="previous month"
                    onClick={prevMonth}
                    size="small"
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" component="div">
                    {format(currentDate, dateFormat, { locale: ko })}
                </Typography>
                <IconButton
                    aria-label="next month"
                    onClick={nextMonth}
                    size="small"
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <ChevronRightIcon />
                </IconButton>
            </Box>
        );
    };

    const renderDays = () => {
        const dateFormat = 'E';
        const days = [];

        let startDate = new Date(currentDate);
        startDate.setDate(1);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

        for (let i = 0; i < 7; i++) {
            days.push(
                <Box key={i} sx={{
                    width: '34px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                }}>
                    {format(startDate, dateFormat, { locale: ko })}
                </Box>
            );
            startDate.setDate(startDate.getDate() + 1);
        }

        return <Box display="flex" justifyContent="space-evenly" mb={2}>{days}</Box>;
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate);
        monthStart.setDate(1);

        const monthEnd = new Date(currentDate);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

        const endDate = new Date(monthEnd);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        const rows = [];
        let days = [];
        let day = new Date(startDate);
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd', { locale: ko });
                const cloneDay = new Date(day);
                const isAbnormal = abnormalDates.some(date => isSameDay(date, cloneDay));

                days.push(
                    <Box
                        key={day.toString()}
                        onClick={() => onDateClick(cloneDay)}
                        sx={{
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            backgroundColor: isSameDay(day, value) ? 'var(--sub-orange-color)' : 'transparent',
                            color: isSameDay(day, value) ? '#fff' : isSameMonth(day, currentDate) ? '#000' : '#ccc',
                            border: 'none',
                            borderRadius: '50%',
                            position: 'relative'
                        }}
                    >
                        {formattedDate}
                        {isAbnormal && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    border: '3px solid #FF6347',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isSameDay(day, value) ? '#FFAB40' : 'transparent',
                                }}
                            >
                                {formattedDate}
                            </Box>
                        )}
                    </Box>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(<Box key={day.toString()} display="flex" justifyContent="space-evenly" mb={1}>{days}</Box>);
            days = [];
        }

        return <Box>{rows}</Box>;
    };

    const prevMonth = () => {
        setCurrentDate(setMonth(currentDate, getMonth(currentDate) - 1));
    };

    const nextMonth = () => {
        setCurrentDate(setMonth(currentDate, getMonth(currentDate) + 1));
    };

    const onDateClick = (day) => {
        setCurrentDate(day);
        onChange(day);
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isSameMonth = (d1, d2) => {
        return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    };

    return (
        <Box>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '3px solid #FF6347',
                    marginRight: '8px'
                }} />
                <Typography sx={{ marginRight: 2 }}>이상</Typography>
            </Box>
        </Box>
    );
}

function RegisteredDetail() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [abnormalDates, setAbnormalDates] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [checkRsltList, setCheckRsltList] = useState([]); // 날짜별 점검 리스트(상세x)
    const [expandedDetail, setExpandedDetail] = useState(false); //점검데이터 상세 펼치기
    const { facilityId, facilityName, facilityTypeNm } = location.state || {};

    useEffect(() => {
        if (facilityId) {
            fetchCheckRsltList(selectedDate);
            fetchAbnormalRsltDates(selectedDate);
        }
    }, [facilityId]);

    // 날짜별 점검 리스트 가져오기
    const fetchCheckRsltList = async (date) => {
        const url = `${common.getApiUrl()}/checker/result/${facilityId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    checkTime: format(date, 'yyyy-MM-dd'),
                },
            });
            const updatedcheckRsltList = response.data
                .map((item) => ({
                    checkRsltMstrId: item.checkRsltMstrId,
                    checkTime: item.checkTime,
                    checkerId: item.checkerId,
                    checkerNm: item.checkerNm,
                    selectedValue: {},
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setCheckRsltList(updatedcheckRsltList);
        } catch (error) {
            common.handleApiError(error);
        }
    };

    // 비정상 점검 데이터 일자 가져오기
    const fetchAbnormalRsltDates = async (month) => {
        const url = `${common.getApiUrl()}/checker/result-time/${facilityId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    month: format(month, 'yyyyMM'),
                },
            });

            const dates = response.data.checkTime.map(dateString => new Date(dateString));
            setAbnormalDates(dates);
        } catch (error) {
            common.handleApiError(error);
        }
    };

    // 날짜 선택
    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchCheckRsltList(date);
        setOpenDatePicker(false);
    };

    const handleOpenDatePicker = () => {
        setOpenDatePicker(true);
        fetchAbnormalRsltDates(selectedDate);
    };

    // 아코디언 선택
    const handleAccordionChange = async (checkRsltMstrId) => {
        await fetchAccordionDetails(checkRsltMstrId);
        setExpandedDetail((prevExpanded) =>
            prevExpanded === checkRsltMstrId ? false : checkRsltMstrId
        );
    };

    // 아코디언 상세 정보 가져오기
    const fetchAccordionDetails = async (checkRsltMstrId) => {
        const url = `${common.getApiUrl()}/checker/result/detail/${checkRsltMstrId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            //점검유형 매핑
            const groupedData = response.data.checkRsltDtlRes.reduce((acc, item) => {
                if (!acc[item.checkTypeId]) {
                    acc[item.checkTypeId] = [];
                }
                acc[item.checkTypeId].push(item);
                return acc;
            }, {});

            setCheckRsltList((prevData) => {
                const newData = [...prevData];

                const index = newData.findIndex(item => item.checkRsltMstrId === checkRsltMstrId);

                if (index !== -1) {
                    // 해당 인덱스의 객체를 업데이트
                    newData[index] = {
                        ...newData[index],
                        selectedValue: groupedData,
                        checkRsltDtls: response.data
                    };
                } else {
                    console.error('해당 점검데이터를 찾을 수 없습니다.');
                }

                return newData;
            });

        } catch (error) {
            common.handleApiError(error);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
                backgroundColor: 'var(--main-blue-color)',
                height: '170px',
                position: 'relative'
            }}>
                <Box sx={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '15px', padding: '0 10px 0 4px' }}
                    onClick={() => navigate(-1)}>
                    <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>이전</Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    color: '#fff',
                    paddingTop: '10px'
                }}>
                    <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
                        {facilityName}
                    </Typography>
                </Box>
            </Box>
            <Container maxWidth="false" sx={{ width: '100%', mx: 'auto', mb: 6, mt: 2 }}>
                <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 1.5 }}>
                    <Grid item xs={12} md={6}>
                        <Box
                            onClick={handleOpenDatePicker}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: 'white'
                            }}
                        >
                            <Typography>
                                {format(selectedDate, 'yyyy년 MM월 dd일')}
                            </Typography>
                            <ExpandMoreIcon />
                        </Box>
                    </Grid>
                </Grid>
                {checkRsltList.length > 0 ? (
                    checkRsltList.map((checkRslt) => (
                        <Accordion
                            disableGutters
                            key={checkRslt.checkRsltMstrId}
                            expanded={expandedDetail === checkRslt.checkRsltMstrId}
                            onChange={() => handleAccordionChange(checkRslt.checkRsltMstrId)}
                            elevation={0}
                            sx={{ borderRadius: 0, marginBottom: '10px' }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    minHeight: '48px',
                                    height: '48px',
                                    padding: '0 16px',
                                    '&.Mui-expanded': {
                                        minHeight: '48px',
                                        height: '48px',
                                    },
                                    '.MuiAccordionSummary-content': {
                                        margin: 0,
                                        alignItems: 'center',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '8px 0',
                                    }}
                                >
                                    <Typography
                                        sx={{ fontWeight: 'bold', fontSize: '1.0rem', }}
                                    >
                                        {checkRslt.checkTime
                                            ? format(
                                                new Date(checkRslt.checkTime.replace(' ', 'T')),
                                                'a h시 mm분',
                                                { locale: ko }
                                            )
                                            : ''}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: '0px' }}>
                                {checkRslt.selectedValue && Object.entries(checkRslt.selectedValue).map(([checkTypeId, items], idx, arr) => (
                                    <React.Fragment key={checkTypeId}>
                                        {arr.length > 0 && (
                                            <>
                                                {idx !== 0 && (
                                                    <Box sx={{
                                                        width: '100%',
                                                        height: '3px',
                                                        backgroundColor: 'var(--main-white-color)',
                                                    }}></Box>
                                                )}
                                                <Box sx={{
                                                    backgroundColor: '#E2E5EB',
                                                    padding: '4px 16px',
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {items[0].checkTypeNm}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}
                                        <TableContainer sx={{ padding: '0px', margin: '0px', width: '100%', overflow: 'hidden' }}>
                                            <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                                                <TableBody>
                                                    {items.map((item, itemIndex) => (
                                                        <React.Fragment key={item.checkItemId}>
                                                            {itemIndex !== 0 && (
                                                                <TableRow>
                                                                    <TableCell sx={{ padding: 0, border: 'none' }}>
                                                                        <Box sx={{
                                                                            height: '1px',
                                                                            backgroundColor: 'var(--main-white-color)',
                                                                            mx: 2,
                                                                        }}></Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            <TableRow sx={{ width: '100%' }}>
                                                                <TableCell sx={{
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1rem',
                                                                    border: 'none',
                                                                    color: '#505050',
                                                                    paddingX: 2,
                                                                    paddingTop: 1,
                                                                    paddingBottom: 1,
                                                                    width: '100%'
                                                                }}>
                                                                    <Box sx={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
                                                                        <Box sx={{ width: '35%', flexShrink: 0 }}>
                                                                            {item.checkItemNm}
                                                                        </Box>
                                                                        <Box sx={{ width: '65%', flexGrow: 1 }}>
                                                                            <Box sx={{display:'flex', flexDirection:'column'}}>
                                                                                <Box sx={{
                                                                                    padding: '4px 8px',
                                                                                    backgroundColor: 'var(--main-white-color)',
                                                                                    color: '#3B62A7',
                                                                                    fontSize: '0.9rem',
                                                                                    overflowWrap: 'break-word', 
                                                                                }}>
                                                                                    {item.checkRsltValNm || ''}
                                                                                </Box>
                                                                                <Box sx={{
                                                                                    padding: '4px 8px',
                                                                                    fontSize: '0.8rem',
                                                                                    overflowWrap: 'break-word', 
                                                                                }}>
                                                                                    특이사항 : {item.rm || ''}
                                                                                </Box>
                                                                                <Box sx={{ marginTop: 1, display: 'flex', }}>
                                                                                    {item.dtlUploadFiles.map((filePath, index) => {
                                                                                        const fileExtension = filePath.split('.').pop().toLowerCase();
                                                                                        const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension);
                                                                                        const isVideo = ['mp4', 'mov', 'avi'].includes(fileExtension);

                                                                                        return (
                                                                                            <div key={index} style={{ marginRight: '10px' }}>
                                                                                                {isImage ? (
                                                                                                    <img
                                                                                                        src={common.getImageBaseUrl() + filePath}
                                                                                                        alt="미리보기"
                                                                                                        style={{ width: '85px', height: 'auto', borderRadius: '4px' }}
                                                                                                    />
                                                                                                ) : (
                                                                                                    <video
                                                                                                        src={common.getImageBaseUrl() + filePath}
                                                                                                        controls
                                                                                                        style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                                                                                    />
                                                                                                )}
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </TableCell>

                                                            </TableRow>
                                                        </React.Fragment>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </React.Fragment>
                                ))}

                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Paper elevation={0} sx={{ padding: '16px', marginBottom: '16px' }}>
                        <Typography variant="body1" align="center">
                            선택한 날짜에 점검 기록이 없습니다.
                        </Typography>
                    </Paper>
                )}
                {/* 달력 다이얼로그 */}
                <Dialog
                    open={openDatePicker}
                    onClose={() => setOpenDatePicker(false)}
                    PaperProps={{
                        style: {
                            position: 'absolute',
                            bottom: 0,
                            height: '70%',
                            width: '100%',
                            margin: 0,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            padding: '0 10px'
                        }
                    }}
                >
                    <DialogTitle sx={{ padding: '10px 24px' }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography>조회</Typography>
                            <IconButton
                                onClick={() => setOpenDatePicker(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{
                            width: '100%',
                            borderBottom: '1px solid #e0e0e0',
                            marginBottom: '10px'
                        }} />
                    </DialogTitle>
                    <DialogContent sx={{ paddingX: '2' }}>
                        <CustomCalendar value={selectedDate} onChange={handleDateChange} abnormalDates={abnormalDates} />
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}

export default validationAuth(RegisteredDetail);