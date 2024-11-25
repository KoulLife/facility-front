import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Typography, TextField, Button, Box, Dialog, DialogContent, DialogContentText } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import PdfViewer from './pdfviewer';
import axios from 'axios';
import * as common from '../../../commons/common';

const SafetyGuide = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { noticeId } = useParams();
    const formData = location.state;
    const [content, setContent] = useState({
        noticeNm: '',
        noticeFiles: []
    });
    const [isOpencompleteDialog, setIsOpencompleteDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0); // 현재 슬라이드 상태 추가

    useEffect(() => {
        window.history.pushState(null, document.title, window.location.href);
        if (formData == null || !noticeId) {
            navigate(`/safetyIntro/${noticeId}`);
        } else {
            fetchData();
        }
    }, [formData, noticeId, navigate]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/qr/notice/${noticeId}`, {
                headers: {'Content-Type': 'application/json'}
            });
            if (response.data) {
                const fetchedItems = {
                    noticeNm: response.data.noticeNm ?? '',
                    noticeFiles: response.data.noticeFiles ?? [],
                }
                setContent(fetchedItems);
            }
        } catch (error) {
            alert('오류가 발생하였습니다. 관리자에게 문의하세요');
        }
    };

    const handleStepChange = (step) => {
        setActiveStep(step); // 현재 슬라이드 변경 시 상태 업데이트
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const url = `${common.getApiUrl()}/notice/notice-confirm/${noticeId}`;

        try {
            const requestData = {
                organizationNm : formData.organizationNm,
                noticeConfirmNm: formData.name,
                dateOfBirth: formData.ssn
            };

            const response = await axios.post(url, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response) {
                setIsOpencompleteDialog(true);
            }
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }
    };

    const renderFile = (file) => {
        const fullPath = `${common.getImageBaseUrl()}${file.filePath}`;
        if (file.fileFormat === 'video' || file.fileFormat === 'mp4') {
            return (
                <video
                    src={fullPath}
                    controls
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            );
        } else if (file.fileFormat === 'pdf') {
            return <PdfViewer url={fullPath} />; // activeStep을 페이지로 설정
        } else if (file.fileFormat === 'jpg' || file.fileFormat === 'png') {
            return (
                <img
                    src={fullPath}
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            );
        } else {
            return <Typography>지원하지 않는 파일 형식입니다.</Typography>;
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 20px',
                    marginTop: '20px',
                    height: '100%'
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                    안전수칙 확인
                </Typography>
                {/* <Typography variant="h6">{content?.noticeNm}</Typography> */}
                <Carousel
                    sx={{
                        textAlign: 'center',
                        marginTop: '20px',
                        minHeight: '500px',
                        width: '100%',
                        margin: '0 auto',
                        borderTop: '1px solid #e0e0e0'
                    }}
                    indicatorContainerProps={{
                        style: {
                            zIndex: 1,
                            marginTop: "10px",
                            position: "relative"
                        }
                    }}
                    autoPlay={false}
                    navButtonsAlwaysInvisible={true}
                    index={activeStep}
                    onChange={(newIndex) => handleStepChange(newIndex)}
                >
                    {content?.noticeFiles.map((file, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '500px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {activeStep === index && renderFile(file)} {/* 렌더링 함수 호출 */}
                        </Box>
                    ))}
                </Carousel>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', marginBottom: '50px' }}>
                    <Button
                        onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
                        disabled={activeStep === 0}
                    >
                        이전
                    </Button>
                    <Button
                        onClick={() => setActiveStep((prev) => Math.min(prev + 1, content.noticeFiles.length - 1))}
                        disabled={activeStep === content.noticeFiles.length - 1}
                    >
                        다음
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: 'var(--main-blue-color)',
                        padding: '7px 35px',
                        fontSize: '1.4rem',
                        borderRadius: '30px',
                        boxShadow: 'none',
                        marginBottom:'20px'
                    }}
                >
                    교육이수 확인
                </Button>
                <Typography sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                    동영상 <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>시청 완료</span> 후<br />
                    반드시 교육이수 확인을 해주세요.
                </Typography>
                <Dialog
                    open={isOpencompleteDialog}
                    onClose={() => { }}
                    PaperProps={{
                        style: {
                            backgroundColor: '#424242',
                            color: 'white',
                            borderRadius: '10px',
                            width: '300px',
                            maxWidth: '500px',
                            marginTop: '-20vh',
                            boxShadow: 'none'
                        },
                    }}
                    disableEscapeKeyDown
                    disableBackdropClick
                >
                    <DialogContent>
                        <DialogContentText
                            sx={{ color: 'white', fontSize: '1.1rem', textAlign: 'center', boxShadow: 'none', wordBreak:'keep-all',}}>
                            안전수칙 이수확인 등록이 완료되었습니다. <br/>페이지를 닫아주시기 바랍니다.
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            </Box>
        </>
    );
};

export default SafetyGuide;
