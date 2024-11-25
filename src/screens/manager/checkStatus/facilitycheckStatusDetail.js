import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, Dialog, DialogContent, DialogContentText
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Carousel from 'react-material-ui-carousel'

const CheckStatusSheet = () => {
    const { facilityId } = useParams();
    const navigate = useNavigate();

    // 오늘 날짜 구하기
    const today = new Date().toISOString().substring(0, 10);

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [facilityInfo, setFacilityInfo] = useState({});
    const [deptPath, setDeptPath] = useState(''); //관리처Tier Path 표출
    const [checkResults, setCheckResults] = useState([]);

    const [cellDtlInfo, setCellDtlInfo] = useState({});
    const cardRef = useRef(null);
    const [dtlCardPosition, setDtlCardPosition] = useState({ top: 0, left: 0 })
    const [mstrFileModal, setMstrFileModal] = useState(false)
    const [mstrFiles, setMstrFiles] = useState([]);

    useEffect(() => {
        // 시설물 정보 가져오기
        const fetchFacilityInfo = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/facility/${facilityId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                const pathParts = [response.data.topDeptNm, response.data.midDeptNm, response.data.botDeptNm].filter(Boolean);
                setDeptPath(pathParts.join(" - "));
                setFacilityInfo(response.data);
            } catch (error) {
                console.error('Error fetching facility details:', error);
            }
        };

        fetchFacilityInfo();
        handleSearch();
    }, [facilityId]);

    const handleStartDateChange = (name, value) => {
        if (name === 'startDate') {
            setStartDate(value);
        }
    };

    const handleEndDateChange = (name, value) => {
        if (name === 'endDate') {
            setEndDate(value);
        }
    };

    // 점검 결과 검색
    const handleSearch = useCallback(async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/check-result/${facilityId}`, {
                params: {
                    startCheckTime: startDate,
                    endCheckTime: endDate,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (response.data && response.data.checkRslt && Array.isArray(response.data.checkRslt)) {
                setCheckResults(response.data.checkRslt);
            } else {
                setCheckResults([]);
            }
        } catch (error) {
            console.error('Error fetching check results:', error);
            setCheckResults([]);
        }
    }, [facilityId, startDate, endDate]);

    const handleRmClick = (event, cellData) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const cardWidth = 220;
        const cardHeight = 250;

        const leftPosition = rect.right + cardWidth > window.innerWidth
            ? window.innerWidth - cardWidth - 10
            : rect.right + 6;

        const topPosition = rect.bottom + cardHeight > window.innerHeight
            ? window.innerHeight - cardHeight - 3
            : rect.bottom + 5;

        setDtlCardPosition({
            top: topPosition,
            left: leftPosition,
        });

        setCellDtlInfo(cellData);
    };

    const handleClickOutside = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
            setCellDtlInfo({});
        }
    };

    const handleWindowEvent = () => {
        setCellDtlInfo({});
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleWindowEvent);
        window.addEventListener('resize', handleWindowEvent);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleWindowEvent);
            window.removeEventListener('resize', handleWindowEvent);
        };
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const openMstrFilesModal = (detail) => {
        setMstrFiles(detail)
        setMstrFileModal(true)
    }

    const closeMstrFileModal = () => {
        setMstrFileModal(false)
    }

    return (
        <Box sx={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <SearchArea
                searchValues={{ startDate: startDate, endDate: endDate }}
                handleSearchChanges={(name, value) => {
                    if (name === 'startDate') {
                        handleStartDateChange(name, value);
                    } else if (name === 'endDate') {
                        handleEndDateChange(name, value);
                    }
                }}
                fields={[
                    {
                        fieldnm: '기간',
                        name: 'startDate',
                        type: 'calendar',
                    },
                    {
                        fieldnm: '~',
                        name: 'endDate',
                        type: 'calendar',
                    }
                ]}
                onSearchClick={handleSearch}
            />
            <Box sx={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: 2,
                marginTop: '20px'
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>시설 정보</Typography>
                <Box sx={{ border: '1px solid #AFAFAF', borderRadius: 1, p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '30%', mr: 2 }}>
                            <Box sx={{
                                width: '100%',
                                height: '10rem',
                                bgcolor: '#F4F4F4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ECECEC',
                                borderRadius: '8px',
                            }}>
                                {facilityInfo.imageFile ? (
                                    <img
                                        src={`${common.getImageBaseUrl()}${facilityInfo.imageFile}`}
                                        alt="시설물"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        이미지 없음
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ width: '70%' }}>
                            <Box sx={{
                                border: '1px solid #E7E7E7',
                                borderRadius: 1,
                                p: 1,
                                mb: 2,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: '#F3F3F3',
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    fontWeight: 'bold',
                                    color: '#0F326A',
                                }}>
                                    {facilityInfo.facilityNm}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                {[
                                    ['시설유형', facilityInfo.facilityTypeNm],
                                    ['관리처', deptPath],
                                    ['점검주기', facilityInfo.checkCycleNm],
                                    // ['점검상태', checkResults.length > 0 ? '점검 완료' : '미점검'],
                                ].map(([label, value], index) => (
                                    <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ width: '100px', position: 'relative' }}>
                                            {label}
                                            <span style={{ position: 'absolute', right: 0 }}>:</span>
                                        </Typography>
                                        <Typography variant="body2"
                                            sx={{ ml: 1, fontWeight: 'bold' }}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>점검 기록</Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none', overflow: 'auto' }} onScroll={() => setCellDtlInfo({})}>
                    <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }} >
                        <TableHead >
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        zIndex: '1',
                                        left: 0,
                                        backgroundColor: '#F2F2F2',
                                        borderTop: '2px solid #909090',
                                        borderBottom: checkResults.length > 0 ? '2px solid #909090' : 'null',
                                        textAlign: 'center',
                                        padding: '10px',
                                        borderLeft: 'none',
                                        width: '100px',
                                        minWidth: '100px',
                                        borderRight: 'none',
                                    }}>
                                    {checkResults.length > 0 ? '점검유형' : ''}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        zIndex: '1',
                                        left: '100px',
                                        width: '120px',
                                        minWidth: '120px',
                                        backgroundColor: '#F2F2F2',
                                        borderTop: '2px solid #909090',
                                        borderBottom: checkResults.length > 0 ? '2px solid #909090' : 'null',
                                        textAlign: 'center',
                                        padding: '10px',
                                        borderLeft: 'none',
                                        borderRight: '2px solid #909090'
                                    }}>
                                    {checkResults.length > 0 ? '점검질문' : ''}
                                </TableCell>
                                {checkResults.map((result, index) => (
                                    <TableCell key={index} sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#F2F2F2',
                                        borderTop: '2px solid #909090',
                                        borderBottom: '2px solid #909090',
                                        textAlign: 'center',
                                        padding: '10px',
                                        minWidth: '100px',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                    }}>
                                        {result.checkTime}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {checkResults && Array.isArray(checkResults) && checkResults.length > 0 ? (
                                Object.values(
                                    (facilityInfo.checkItems || []).reduce((acc, item) => {
                                        if (!acc[item.checkTypeId]) {
                                            acc[item.checkTypeId] = { checkTypeNm: item.checkTypeNm, items: [] };
                                        }
                                        acc[item.checkTypeId].items.push(item);
                                        return acc;
                                    }, {})
                                ).map((group) =>
                                    group.items.map((item, rowIndex) => (
                                        <TableRow key={item.checkItemId} sx={{ '&:last-child td': { borderBottom: '2px solid #909090' } }}>
                                            {rowIndex === 0 && (
                                                <TableCell
                                                    rowSpan={group.items.length}
                                                    sx={{
                                                        backgroundColor: '#f5f5f5',
                                                        position: 'sticky',
                                                        left: 0,
                                                        zIndex: 1,
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle',
                                                        width: '15%',
                                                        textWrap: 'balance',
                                                        border: '1px solid #E7E7E7',
                                                    }}
                                                >
                                                    {group.checkTypeNm}
                                                </TableCell>
                                            )}
                                            <TableCell sx={{
                                                backgroundColor: '#f5f5f5',
                                                position: 'sticky',
                                                left: '100px',
                                                zIndex: 1,
                                                minWidth: '120px',
                                                borderRight: '2px solid #909090'
                                            }}>
                                                {item.checkItemNm}
                                            </TableCell>
                                            {checkResults.map((result, colIndex) => {
                                                const detail = result.checkRsltDtlList.find(
                                                    (detail) => detail.checkItemId === item.checkItemId
                                                );
                                                return (
                                                    <TableCell key={colIndex} sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle', width: 'auto', maxWidth: '200px', wordWrap: 'break-word', position: 'relative' }}
                                                    >
                                                        {detail ? detail.checkRsltValNm : ''}
                                                        {detail.rm || detail.dtlUploadFiles.length > 0 ? (
                                                            <Box sx={{ position: 'absolute', right: 0, bottom: '-3px' }}>
                                                                <InfoOutlinedIcon sx={{ opacity: cellDtlInfo.checkRsltDtlId === detail.checkRsltDtlId ? '100%' : '65%', width: '60%', cursor: "pointer", color: 'var(--main-softblue-color)' }} onClick={(e) => handleRmClick(e, detail)} />
                                                            </Box>
                                                        ) : (null)}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                )
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={checkResults.length + 2} sx={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f5f5f5' }}>
                                        점검 기록이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                            {checkResults && checkResults.length > 0 && (
                                <TableRow sx={{ borderTop: '2px solid #e0e0e0' }}>
                                    <TableCell
                                        colSpan={2}
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            position: 'sticky',
                                            zIndex: '1',
                                            left: 0,
                                            borderTop: '2px solid #909090',
                                            borderRight: '2px solid #909090',
                                            textAlign: 'center'
                                        }}
                                    >
                                        점검자
                                    </TableCell>
                                    {checkResults.map((result, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                borderRight: '1px solid #e0e0e0',
                                                borderTop: '2px solid #909090',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                            }}
                                        >
                                            {result.checkerNm}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                            {/* 첨부 파일 */}
                            {checkResults && checkResults.length > 0 && (
                                <TableRow sx={{ borderTop: '2px solid #e0e0e0' }}>
                                    <TableCell
                                        colSpan={2}
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            position: 'sticky',
                                            zIndex: '1',
                                            left: 0,
                                            borderTop: '2px solid #909090',
                                            borderRight: '2px solid #909090',
                                            textAlign: 'center'
                                        }}
                                    >
                                        첨부 파일
                                    </TableCell>
                                    {checkResults.map((result, index) => {
                                        const detail = checkResults.find(
                                            (detail) => result.checkRsltMstrId === detail.checkRsltMstrId
                                        );
                                        return (
                                            <TableCell
                                                key={index}
                                                sx={{
                                                    borderRight: '1px solid #e0e0e0',
                                                    borderTop: '2px solid #909090',
                                                    textAlign: 'center',
                                                    verticalAlign: 'middle',
                                                }}
                                            >
                                                {detail && detail.mstrUploadFiles.length > 0 ? (
                                                    <ButtonOnTable text="조회" onClick={() => openMstrFilesModal(detail.mstrUploadFiles)} />
                                                ) : null}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {Object.keys(cellDtlInfo).length !== 0 && (
                    <Card
                        ref={cardRef} // 카드의 위치 추적을 위한 ref 설정
                        sx={{
                            position: 'fixed',
                            top: dtlCardPosition.top,
                            left: dtlCardPosition.left,
                            width: 220,
                            maxHeight: 250,
                            padding: 2,
                            boxShadow: 3,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="body1">특이사항</Typography>
                        <Typography variant="body2">
                            {cellDtlInfo.rm}
                        </Typography>
                        {cellDtlInfo.dtlUploadFiles.length > 0 ? (
                            <Box sx={{ width: '100%', maxHeight: '150px', overflow: 'hidden' }}>
                                <Carousel
                                    autoPlay={false}
                                    indicators={cellDtlInfo.dtlUploadFiles.length > 1}
                                    navButtonsAlwaysInvisible={cellDtlInfo.dtlUploadFiles.length < 2}
                                    navButtonsAlwaysVisible={cellDtlInfo.dtlUploadFiles.length > 1}
                                    animation="slide"
                                    sx={{
                                        '& .MuiButtonBase-root': {
                                            padding: '4px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            },
                                            '&.Mui-disabled': {
                                                display: 'none',
                                            },
                                        },
                                    }}
                                >
                                    {cellDtlInfo.dtlUploadFiles.map((file, index) => (
                                        <Box key={index} sx={{ width: '100%', height: '150px' }}>
                                            {file.endsWith('.mp4') ? (
                                                <video
                                                    src={`${common.getImageBaseUrl()}${file}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                    controls
                                                />
                                            ) : (
                                                <img
                                                    src={`${common.getImageBaseUrl()}${file}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Carousel>
                            </Box>
                        ) : (null)}
                    </Card>
                )}
            </Box>
            <Dialog
                open={mstrFileModal}
                onClose={closeMstrFileModal}
            >
                <DialogContent>
                    <Box sx={{ width: '300px', maxHeight: '300px' }}>
                        <Carousel
                            autoPlay={false}
                            indicators={mstrFiles.length > 1}
                            navButtonsAlwaysInvisible={mstrFiles.length < 2}
                            navButtonsAlwaysVisible={mstrFiles.length > 1}
                            animation="slide"
                            sx={{
                                '& .MuiButtonBase-root': {
                                    padding: '4px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                    '&.Mui-disabled': {
                                        display: 'none',
                                    },
                                },
                            }}
                        >
                            {mstrFiles.map((file, index) => (
                                <Box key={index} sx={{ width: '100%', height: '150px' }}>
                                    {file.endsWith('.mp4') ? (
                                        <video
                                            src={`${common.getImageBaseUrl()}${file}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                            }}
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={`${common.getImageBaseUrl()}${file}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Carousel>
                    </Box>
                </DialogContent>
            </Dialog>
            <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#B1BBCC',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#A0AABC' },
                        boxShadow: 'none',
                        fontSize: '1.1rem',
                        padding: '5px 20px'
                    }}
                    onClick={() => navigate(-1)}
                >
                    돌아가기
                </Button>
            </Box>
        </Box>
    );
};

export default CheckStatusSheet;