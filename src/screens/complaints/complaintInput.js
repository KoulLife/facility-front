import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, IconButton, Dialog, DialogContent,
    DialogContentText, Snackbar, Alert, Input
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../commons/common';

export default function ComplaintInput() {
    const navigate = useNavigate();
    const location = useLocation();
    const { facilityId } = useParams();

    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [facilityName, setFacilityName] = useState('');
    const [facilityTypeId, setFacilityTypeId] = useState('');
    const [group, setGroup] = useState('');
    const [complaintDatas, setComplaintDatas] = useState([]); //민원항목 리스트
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [summitLoading, setSummitLoading] = useState(false);

    useEffect(() => {
        setSummitLoading(false)
        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // qr 데이터 가져오기
        const fetchData = async () => {
            const url = `${common.getApiUrl()}/qr/${facilityId}`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data) {
                    setFacilityName(response.data.facilityNm);
                    setFacilityTypeId(response.data.facilityTypeId);
                    setGroup(response.data.groupNm);
                    const url = `${common.getApiUrl()}/qr/facility-type/complaint-item`;
                    const facilityTypeId = response.data.facilityTypeId
                    try {
                        const response = await axios.get(url, {
                            params: { facilityTypeId },
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.data) {
                            setComplaintDatas(response.data.map(item => item.complaintItemNm));
                        }
                    } catch (error) {
                        common.handleApiError(error);
                    }
                }
            } catch (error) {
                common.handleApiError(error);
            }
        };

        fetchData();

        // URL에서 msg 매개변수 추출
        const queryParams = new URLSearchParams(location.search);
        const msg = queryParams.get('msg');
        if (msg) {
            setOpen(true);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [open, location, facilityId]);

    const handlePopState = (event) => {
        window.history.pushState(null, document.title, window.location.href);
    };

    const handleBeforeUnload = (event) => {
        if (open) {
            event.preventDefault();
            event.returnValue = '';
            return '';
        }
    };

    const handleCheckRecords = () => {
        if (!open) {
            navigate(`/complaint-check-list/${facilityId}`);
        }
    };


    const handleCardClick = (index) => {
        if (filledCardData[index]) {
            if (selectedCardId === index) {
                // 이미 선택된 카드를 다시 클릭하면 선택 취소
                setSelectedCardId(null);
                setInputValue('');
            } else {
                // 새로운 카드 선택
                setSelectedCardId(index);
                setInputValue(filledCardData[index]);
            }
        }
    };

    
    const userInputCheck = () => {
        return !selectedCardId && !inputValue.trim()
    };


    useEffect(() => {
        const noUserInput = userInputCheck();
        const buttonElement = document.getElementById("submitButton");

        if (buttonElement) {
            buttonElement.style.backgroundColor = noUserInput ?  'var(--sub-darkgrey-color)' : 'var(--main-blue-color)' ;
            buttonElement.disabled = noUserInput;
        }
    }, [selectedCardId, inputValue]);

    //민원 제출 처리
    const handleSubmit = async () => {
        setSummitLoading(true)
        const selectedComplaint = selectedCardId !== null ? filledCardData[selectedCardId] : inputValue;
        if (!selectedComplaint.trim()) {
            setSnackbarOpen(true);
            return;
        }

        const complaintDatas = {
            complaintContent: selectedComplaint,
            facilityId: parseInt(facilityId, 10)
        };

        try {
            const response = await axios.post(`${common.getApiUrl()}/qr`, complaintDatas, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                navigate(`/complaint-input/${facilityId}?msg=${encodeURIComponent(selectedComplaint)}`);
            }
        } catch (error) {
            common.handleApiError(error);
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // 카드 데이터를 3의 배수로 맞추기 위해 빈 카드 추가
    const filledCardData = [...complaintDatas];
    while (filledCardData.length % 3 !== 0) {
        filledCardData.push('');
    }

    // 최소 9개의 카드를 보장
    if (filledCardData.length < 9) {
        while (filledCardData.length < 9) {
            filledCardData.push('');
        }
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            {/* 헤더 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '170px',
                backgroundColor: 'var(--main-blue-color)',
                color: '#fff'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}>
                    {/* <Typography variant="body2" sx={{ fontSize: '1.0rem', fontWeight: 'bold' }}>
                        {group}
                    </Typography> */}
                    <Typography variant="h6" sx={{ fontSize: '1.8rem', paddingTop: '10px' }}>
                        {facilityName}
                    </Typography>
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    borderRadius: '15px',
                    padding: '0 10px 0 4px'
                }}
                    onClick={handleCheckRecords}
                >                <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                        <ArrowForwardIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>점검기록</Typography>
                </Box>
            </Box>
            <Box
                sx={{ margin: '20px', marginTop: '40px', bgcolor: '#fff', borderRadius: '15px' }}>
                <Box>
                    {complaintDatas.length > 0 ? (
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '25px 0px 25px 35px' }} >
                            요청사항을 체크해주세요.
                        </Typography>
                    ) : (
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '25px 0px 25px 35px' }} >
                            불편사항을 작성해주세요.
                        </Typography>
                    )}
                </Box>
                {complaintDatas.length > 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '10px 20px 20px 20px',
                        borderTop: '1px solid #3333'
                    }}>
                        {complaintDatas.map((data, index) => (
                            <Button
                                key={index}
                                onClick={() => handleCardClick(index)}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    backgroundColor: selectedCardId === index ? '#f0f0f0' : '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                }}
                            >
                                {
                                    selectedCardId !== index ? (
                                        <CheckCircleOutlineIcon sx={{ marginRight: '25px', color: '#333', scale: '1.3', opacity: '70%' }} />
                                    ) : (
                                        <CheckCircleIcon sx={{ color: 'var(--main-blue-color)', marginRight: '25px', scale: '1.3' }} />
                                    )
                                }
                                <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333', opacity: selectedCardId !== index ? '70%' : '100%', }}>
                                    {data}
                                </Typography>
                            </Button>
                        ))}
                    </Box>
                ) : (null)}
            </Box>
            <Box
                sx={{ margin: '20px', marginTop: '0', bgcolor: '#fff', borderRadius: '15px', padding: '25px', paddingBottom: '0' }}>
                <Input
                    placeholder='불편사항을 작성해주세요'
                    value={inputValue}
                    autoComplete="off"
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{ width: '100%', paddingLeft: '30px', }}
                />
                <DriveFileRenameOutlineIcon sx={{ position: 'relative', bottom: '30px' }} />
            </Box>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    width: '100%',
                    py: 2,
                    boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    left: 0,
                    px: '20px',
                    boxSizing: 'border-box',
                    zIndex: 1300,
                }}
            >
                <Button
                    id="submitButton"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{maxWidth: '600px', fontSize: '1.3rem', boxShadow: 'none', borderRadius: '30px',}}
                    disabled={summitLoading}
                    onClick={handleSubmit}
                >
                    접수하기
                </Button>
            </Box>
            <Dialog
                open={open}
                onClose={() => {
                }}
                PaperProps={{
                    style: {
                        backgroundColor: '#424242',
                        color: 'white',
                        borderRadius: '10px',
                        width: '300px',
                        maxWidth: '500px',
                        height: '100px',
                        marginTop: '-20vh',
                        boxShadow: 'none'
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none'
                    },
                }}
                disableEscapeKeyDown
                disableBackdropClick
            >
                <DialogContent>
                    <DialogContentText
                        sx={{ color: 'white', fontSize: '1.1rem', textAlign: 'center', boxShadow: 'none' }}>
                        접수 완료되었습니다.<br /> 페이지를 닫아주시기 바랍니다.
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
                    불편사항을 선택해주세요.
                </Alert>
            </Snackbar>
        </Box>
    );
}