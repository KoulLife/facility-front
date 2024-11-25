import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import {
    Box, Typography, IconButton, Button, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
    ToggleButtonGroup, ToggleButton, TextField,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import imageEmpty from '../../images/image_empty.png';
import imageUpload from '../../images/image_upload.png'
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { format, subDays } from 'date-fns';
import axios from 'axios';
import * as common from '../../commons/common';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ko } from 'date-fns/locale';

const ImprovementInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        facilityId,
        facilityName: locationFacilityName,
        facilityTypeNm: locationFacilityTypeNm
    } = location.state || {};
    const [facilityType, setFacilityType] = useState(locationFacilityTypeNm || '');
    const [facilityName, setFacilityName] = useState(locationFacilityName || '');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [issues, setIssues] = useState([]);
    const [resolves, setResolves] = useState({});
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [improvementContent, setImprovementContent] = useState('');
    const [timePeriod, setTimePeriod] = useState('오늘');
    const [statusFilter, setStatusFilter] = useState('전체');
    const [sortOrder, setSortOrder] = useState('최신순');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('오늘');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('전체');
    const [selectedSortOrder, setSelectedSortOrder] = useState('최신순');
    const [hasPrevData, setHasPrevData] = useState(false);
    const [hasNextData, setHasNextData] = useState(false);
    const [showImprovementForm, setShowImprovementForm] = useState({});
    const [displayDate, setDisplayDate] = useState(new Date());
    const [currentIssueId, setCurrentIssueId] = useState(null);
    const [isEditing, setIsEditing] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [currentSortOrder, setCurrentSortOrder] = useState('DESC');
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [currentResolveImageIndexes, setCurrentResolveImageIndexes] = useState({});

    const toggleButtonStyles = {
        fontWeight: 'bold',
        '&.Mui-selected': {
            borderColor: '#4B9FE2',
            borderWidth: '2px',
            backgroundColor: 'transparent',
        }
    };

    const handleShowResolveBox = (issue) => {
        if (!issue.issuesId) {
            console.error("Issue ID is undefined");
            return;
        }
        navigate(`/checker/improvement-info-registration/${issue.issuesId}`, {
            state: {
                facilityName,
                facilityType,
                issueId: issue.issuesId
            },
        });
    };

    const changeImage = (issueId, direction) => {
        setCurrentImageIndexes(prevIndexes => {
            const currentIndex = prevIndexes[issueId] || 0;
            const issue = filteredIssues.find(issue => issue.issuesId === issueId);
            const imagesCount = issue.issueImgSrc.length;
            let newIndex;
            if (direction === 'next') {
                newIndex = (currentIndex + 1) % imagesCount;
            } else {
                newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
            }
            return { ...prevIndexes, [issueId]: newIndex };
        });
    };

    const changeResolveImage = (issueId, direction) => {
        setCurrentResolveImageIndexes(prevIndexes => {
            const currentIndex = prevIndexes[issueId] || 0;
            const resolve = resolves[issueId];
            const imagesCount = resolve?.resolveImgSrc?.length || 0;
            let newIndex;
            if (direction === 'next') {
                newIndex = (currentIndex + 1) % imagesCount;
            } else {
                newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
            }
            return { ...prevIndexes, [issueId]: newIndex };
        });
    };

    const handleTimePeriodChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedTimePeriod(newValue);

            const endDate = new Date();
            let startDate;
            switch (newValue) {
                case '오늘':
                    startDate = new Date();
                    break;
                case '일주일':
                    startDate = subDays(endDate, 6);
                    break;
                case '2주':
                    startDate = subDays(endDate, 13);
                    break;
                case '1개월':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                default:
                    startDate = new Date();
            }
            setStartDate(startDate);
            setEndDate(endDate);
        }
    };

    const handleStatusFilterChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedStatusFilter(newValue);
        }
    };
    
    const handleSortOrderChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedSortOrder(newValue);
        }
    };

    const handleFilterDialogOpen = () => setFilterDialogOpen(true);

    const handleFilterDialogClose = () => {
        setFilterDialogOpen(false);
        setTimePeriod(selectedTimePeriod);
        setStatusFilter(selectedStatusFilter);
        setSortOrder(selectedSortOrder);
        handleSearch();
    };

    useEffect(() => {
        if (facilityId) {
            const today = new Date();
            setStartDate(today);
            setEndDate(today);
            fetchIssues(today, today, '', 'ASC');
        }
    }, [facilityId]);

    useEffect(() => {
        if (issues.length > 0) {
            const initialResolves = issues.reduce((acc, issue) => {
                if (issue.issueResovleId) {
                    acc[issue.issuesId] = {
                        resolveContent: issue.resolveContent,
                        resolveImgSrc: issue.resolveImgSrc,
                    };
                }
                return acc;
            }, {});
            setResolves(initialResolves);
        }
    }, [issues]);

    const handleSearch = () => {
        if (startDate && endDate && facilityId) {
            const resolveYn = selectedStatusFilter === '개선전' ? 'N' : selectedStatusFilter === '개선후' ? 'Y' : '';
            const sort = selectedSortOrder === '최신순' ? 'DESC' : 'ASC';
            fetchIssues(startDate, endDate, resolveYn, sort);
        } else {
            alert('시작 날짜, 종료 날짜를 선택하고 시설을 선택해주세요.');
        }
    };

    const updateFilteredIssues = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const newFilteredIssues = issues.filter(issue =>
            format(new Date(issue.checkTime), 'yyyy-MM-dd') === formattedDate
        );
        setFilteredIssues(newFilteredIssues);
        updateButtonStates(date);
    };

    const handlePrevDate = () => {
        const currentIndex = availableDates.indexOf(format(displayDate, 'yyyy-MM-dd'));
        if (currentSortOrder === 'DESC') {
            if (currentIndex < availableDates.length - 1) {
                const prevDate = new Date(availableDates[currentIndex + 1]);
                setDisplayDate(prevDate);
                updateFilteredIssues(prevDate);
            }
        } else {
            if (currentIndex > 0) {
                const prevDate = new Date(availableDates[currentIndex - 1]);
                setDisplayDate(prevDate);
                updateFilteredIssues(prevDate);
            }
        }
    };

    const handleNextDate = () => {
        const currentIndex = availableDates.indexOf(format(displayDate, 'yyyy-MM-dd'));
        if (currentSortOrder === 'DESC') {
            if (currentIndex > 0) {
                const nextDate = new Date(availableDates[currentIndex - 1]);
                setDisplayDate(nextDate);
                updateFilteredIssues(nextDate);
            }
        } else {
            if (currentIndex < availableDates.length - 1) {
                const nextDate = new Date(availableDates[currentIndex + 1]);
                setDisplayDate(nextDate);
                updateFilteredIssues(nextDate);
            }
        }
    };

    const updateButtonStates = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const currentIndex = availableDates.indexOf(formattedDate);
        if (currentSortOrder === 'DESC') {
            setHasPrevData(currentIndex < availableDates.length - 1);
            setHasNextData(currentIndex > 0);
        } else {
            setHasPrevData(currentIndex > 0);
            setHasNextData(currentIndex < availableDates.length - 1);
        }
    };

    useEffect(() => {
        if (issues.length > 0 && availableDates.length > 0) {
            const initialDate = new Date(availableDates[0]);
            setDisplayDate(initialDate);
            updateFilteredIssues(initialDate);
        }
    }, [issues, availableDates]);

    useEffect(() => {
        if (displayDate && issues.length > 0) {
            updateFilteredIssues(displayDate);
            updateButtonStates(displayDate);
        }
    }, [displayDate, issues]);


    const fetchIssues = async (startSearchDate, endSearchDate, resolveYn, sort, page = 0, pageSize = 10) => {
        if (loading) return;
        setLoading(true);

        const url = `${common.getApiUrl()}/checker/issue-list/${facilityId}`;
        const token = localStorage.getItem('access_token');

        try {
            const params = {
                startSearchDate: format(startSearchDate, 'yyyy-MM-dd'),
                endSearchDate: format(endSearchDate, 'yyyy-MM-dd'),
                resolveYn: resolveYn || '',
                sort: sort // 'DESC' 또는 'ASC'
            };

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: params
            });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const fetchedIssues = response.data;
                setIssues(fetchedIssues);
                setCurrentSortOrder(sort);

                const datesWithData = [...new Set(fetchedIssues.map(issue => format(new Date(issue.checkTime), 'yyyy-MM-dd')))];
                const sortedDates = datesWithData.sort((a, b) => {
                    return sort === 'DESC' ? new Date(b) - new Date(a) : new Date(a) - new Date(b);
                });
                setAvailableDates(sortedDates);

                if (sortedDates.length > 0) {
                    const initialDate = new Date(sortedDates[0]);
                    setDisplayDate(initialDate);
                    updateFilteredIssues(initialDate);
                }
            } else {
                // 데이터가 없을 때
                setIssues([]);
                setAvailableDates([]);
                setFilteredIssues([]);
                setDisplayDate(null);
            }
        } catch (error) {
            setIssues([]);
            setAvailableDates([]);
            setFilteredIssues([]);
            setDisplayDate(null);
            common.handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ko}>
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
                {/* 필터 박스 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#D3D3D3',
                    padding: '10px 20px',
                    borderBottom: '1px solid #ddd',
                    boxShadow: 'none',
                    color: 'black',
                    margin: 2,
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
                    onClick={handleFilterDialogOpen}
                >
                    <Typography variant="body2" sx={{
                        marginRight: '1px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                    }}>{timePeriod}</Typography>
                    <Typography sx={{
                        color: '#BBC0C9',
                        mx: 0.5,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                    }}>|</Typography>
                    <Typography variant="body2" sx={{
                        marginRight: '1px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                    }}>{statusFilter}</Typography>
                    <Typography sx={{
                        color: '#BBC0C9',
                        mx: 0.5,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                    }}>|</Typography>
                    <Button
                        variant="text"
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{
                            padding: '0',
                            color: 'black',
                            textTransform: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {sortOrder}
                    </Button>
                </Box>
                {/* 날짜 선택기 */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    paddingLeft: 2,
                    paddingRight: 2,
                }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <DatePicker
                                label="시작 날짜"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                format="yyyy년 MM월 dd일"
                                slotProps={{
                                    textField: {
                                        sx: {
                                            width: '49%',
                                            '& .MuiInputBase-root': {
                                                height: '45px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingRight: '4px',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '0.75rem',
                                                padding: '8px 4px',
                                                height: '100%',
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.75rem',
                                            },
                                        },
                                        InputLabelProps: {
                                            shrink: true,
                                        },
                                        inputProps: {
                                            placeholder: 'YYYY년 MM월 DD일',
                                        },
                                    },
                                }}
                                components={{
                                    OpenPickerIcon: () => null,
                                }}
                            />
                            <Typography sx={{ margin: '0 4px' }}>~</Typography>
                            <DatePicker
                                label="종료 날짜"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                format="yyyy년 MM월 dd일"
                                slotProps={{
                                    textField: {
                                        sx: {
                                            width: '49%',
                                            '& .MuiInputBase-root': {
                                                height: '45px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingRight: '4px',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '0.75rem',
                                                padding: '8px 4px',
                                                height: '100%',
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.75rem',
                                            },
                                        },
                                        InputLabelProps: {
                                            shrink: true,
                                        },
                                        inputProps: {
                                            placeholder: 'YYYY년 MM월 DD일',
                                        },
                                    },
                                }}
                                components={{
                                    OpenPickerIcon: () => null,
                                }}
                            />
                        </Box>
                    </LocalizationProvider>
                    <Button
                        variant="contained"
                        sx={{
                            marginLeft: '5px',
                            backgroundColor: 'var(--main-blue-color)',
                            boxShadow: 'none',
                            height: '45px',
                            width: '45px',
                            minWidth: '45px',
                            '&:hover': {
                                backgroundColor: 'var(--main-blue-color)',
                                boxShadow: 'none',
                            },
                            '&:active': {
                                boxShadow: 'none',
                            },
                        }}
                        onClick={handleSearch}
                    >
                        <SearchIcon style={{ color: 'white' }} />
                    </Button>
                </Box>
                {/* 일자 표시 박스 */}
                {availableDates.length > 0 && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        backgroundColor: 'white',
                        paddingX: 2,
                        my: 2,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                    }}>
                        <IconButton onClick={handlePrevDate} disabled={!hasPrevData} sx={{ padding: '10px' }}>
                            {currentSortOrder === 'DESC' ? <ChevronLeftIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                        <Typography sx={{ fontSize: '0.8rem', padding: '10px' }}>
                            {format(displayDate, 'yyyy년 MM월 dd일')}
                        </Typography>
                        <IconButton onClick={handleNextDate} disabled={!hasNextData} sx={{ padding: '10px' }}>
                            {currentSortOrder === 'DESC' ? <ChevronRightIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </Box>
                )}
                {/* 데이터가 없는 경우 */}
                {availableDates.length === 0 && !loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <Typography sx={{ fontSize: '1rem', color: '#7C7C7C' }}>
                            등록 데이터가 없습니다.
                        </Typography>
                    </Box>
                )}
                {filteredIssues.length > 0 && filteredIssues.map((issue, index) => (
                    <React.Fragment key={issue.issuesId || index}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            padding: '0px 20px',
                        }}>
                            <Paper elevation={0} sx={{ width: '100%', padding: '10px' }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '1px grey',
                                    backgroundColor: '#EBEBEB',
                                    height: 150,
                                    position: 'relative',
                                }}>
                                    {issue.issueImgSrc && issue.issueImgSrc.length > 0 ? (
                                        <>
                                            <IconButton
                                                onClick={() => changeImage(issue.issuesId, 'prev')}
                                                sx={{ position: 'absolute', left: 0, zIndex: 1 }}
                                            >
                                                <ChevronLeftIcon />
                                            </IconButton>
                                            <img
                                                src={common.getImageBaseUrl() + issue.issueImgSrc[currentImageIndexes[issue.issuesId] || 0]}
                                                alt="example"
                                                style={{
                                                    maxWidth: '80%', maxHeight: '80%', objectFit: 'contain',
                                                }}
                                            />
                                            <IconButton
                                                onClick={() => changeImage(issue.issuesId, 'next')}
                                                sx={{ position: 'absolute', right: 0, zIndex: 1 }}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                            <Typography
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 5,
                                                    right: 5,
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    color: 'white',
                                                    padding: '2px 5px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                {`${(currentImageIndexes[issue.issuesId] || 0) + 1} / ${issue.issueImgSrc.length}`}
                                            </Typography>
                                        </>
                                    ) : (
                                        <img src={imageEmpty} alt="example"
                                            style={{
                                                maxWidth: '80%', maxHeight: '80%', objectFit: 'contain',
                                            }}
                                        />
                                    )}
                                </Box>
                                <Box sx={{
                                    padding: '10px',
                                    border: '1px solid #E2E6EC',
                                    borderRadius: '4px',
                                    mt: 1,
                                }}>
                                    <Typography variant="h6">
                                        {issue.checkTypeNm || ''}
                                    </Typography>
                                    <Typography variant="body2">
                                        {issue.issueContent || "작성 내용이 없습니다."}
                                    </Typography>
                                </Box>
                                {/* 개선 완료되지 않은 이상사항일 때 버튼 표시 */}
                                {!issue.issueResovleId && statusFilter !== '개선후' && currentIssueId !== issue.issuesId && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button variant="contained" disabled
                                            sx={{ backgroundColor: '#ACB7C7', color: 'white', boxShadow: 'none', }}>
                                            개선전
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleShowResolveBox(issue)}
                                            sx={{
                                                backgroundColor: 'var(--main-blue-color)',
                                                color: 'white',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '0.7rem',
                                                minWidth: '120px',
                                                boxShadow: 'none'
                                            }}
                                        >
                                            개선안 등록하기
                                        </Button>
                                    </Box>
                                )}

                                {/* 개선사항 폼 */}
                                {(currentIssueId === issue.issuesId || issue.issueResovleId) && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <ArrowDownwardIcon
                                                sx={{ width: '45px', height: '45px', color: '#7C7C7C' }} />
                                        </Box>
                                        <Box
                                            sx={{
                                                border: '1px dashed grey',
                                                backgroundColor: '#EBEBEB',
                                                height: 150,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: isEditing[issue.issuesId] ? 'pointer' : 'default',
                                                position: 'relative'
                                            }}
                                            onClick={isEditing[issue.issuesId] ? () => document.getElementById(`upload-input-${issue.issuesId}`).click() : undefined}
                                        >
                                            {imagePreviewUrl ? (
                                                <img
                                                    src={imagePreviewUrl}
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            ) : resolves[issue.issuesId]?.resolveImgSrc && resolves[issue.issuesId]?.resolveImgSrc.length > 0 ? (
                                                <>
                                                    <IconButton
                                                        onClick={() => changeResolveImage(issue.issuesId, 'prev')}
                                                        sx={{ position: 'absolute', left: 0, zIndex: 1 }}
                                                    >
                                                        <ChevronLeftIcon />
                                                    </IconButton>
                                                    <img
                                                        src={common.getImageBaseUrl() + resolves[issue.issuesId].resolveImgSrc[currentResolveImageIndexes[issue.issuesId] || 0]}
                                                        alt="Resolved"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => changeResolveImage(issue.issuesId, 'next')}
                                                        sx={{ position: 'absolute', right: 0, zIndex: 1 }}
                                                    >
                                                        <ChevronRightIcon />
                                                    </IconButton>
                                                    <Typography
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 5,
                                                            right: 5,
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            padding: '2px 5px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        {`${(currentResolveImageIndexes[issue.issuesId] || 0) + 1} / ${resolves[issue.issuesId].resolveImgSrc.length}`}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <img
                                                        src={imageUpload}
                                                        alt="이미지 업로드"
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            alignSelf: 'center',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)'
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        component="span"
                                                        sx={{
                                                            color: '#A4A4A4',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold',
                                                            position: 'absolute',
                                                            bottom: 10,
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        사진을 올리시려면 이곳을 클릭하세요.
                                                    </Typography>
                                                </>
                                            )}
                                            <input
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id={`upload-input-${issue.issuesId}`}
                                                type="file"
                                                onChange={handleFileChange}
                                            />
                                        </Box>
                                        <Box sx={{
                                            padding: '10px',
                                            border: '1px solid #E2E6EC',
                                            borderRadius: '4px',
                                            mt: 1,
                                        }}>
                                            <Typography variant="h6">
                                                {issue.checkTypeNm || ''}
                                            </Typography>
                                            {isEditing[issue.issuesId] ? (
                                                <TextField
                                                    label="개선사항 입력"
                                                    multiline
                                                    rows={4}
                                                    autoComplete="off"
                                                    value={improvementContent}
                                                    onChange={(e) => setImprovementContent(e.target.value)}
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{ mt: 1 }}
                                                />
                                            ) : (
                                                <Typography variant="body2">
                                                    {resolves[issue.issuesId]?.resolveContent || '개선 내용 입력해주세요.'}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#21509E',
                                                    color: 'white',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        boxShadow: 'none',
                                                    },
                                                    '&:active': {
                                                        boxShadow: 'none',
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: '#21509E',
                                                        color: 'white',
                                                    },
                                                }}
                                                disabled={!resolves[issue.issuesId]}
                                            >
                                                개선완료
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#429BE1',
                                                    color: 'white',
                                                    borderRadius: '16px',
                                                    padding: '4px 12px',
                                                    fontSize: '0.7rem',
                                                    boxShadow: 'none',
                                                    minWidth: '120px',
                                                    '&:hover': {
                                                        backgroundColor: '#429BE1',
                                                        boxShadow: 'none',
                                                    },
                                                    '&:active': {
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                                onClick={() => handleShowResolveBox(issue)}
                                            >
                                                수정하기
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        </Box>
                    </React.Fragment>
                ))}
                {/* 조회 설정 다이얼로그 */}
                <Dialog
                    open={filterDialogOpen}
                    onClose={handleFilterDialogClose}
                    fullScreen
                    PaperProps={{
                        sx: {
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            height: '70%',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                        },
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        조회 설정
                        <IconButton
                            aria-label="close"
                            onClick={handleFilterDialogClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 10,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom >
                            기간선택
                        </Typography>
                        <ToggleButtonGroup
                            value={selectedTimePeriod}
                            exclusive
                            onChange={handleTimePeriodChange}
                            aria-label="기간선택"
                            fullWidth
                        >
                            <ToggleButton value="오늘" aria-label="오늘" sx={toggleButtonStyles}>오늘</ToggleButton>
                            <ToggleButton value="일주일" aria-label="일주일" sx={toggleButtonStyles}>일주일</ToggleButton>
                            <ToggleButton value="2주" aria-label="2주" sx={toggleButtonStyles}>2주</ToggleButton>
                            <ToggleButton value="1개월" aria-label="1개월" sx={toggleButtonStyles}>1개월</ToggleButton>
                        </ToggleButtonGroup>
                        <Typography gutterBottom sx={{ marginTop: 2 }}>
                            상태선택
                        </Typography>
                        <ToggleButtonGroup
                            value={selectedStatusFilter}
                            exclusive
                            onChange={handleStatusFilterChange}
                            aria-label="상태선택"
                            fullWidth
                        >
                            <ToggleButton value="전체" aria-label="전체" sx={toggleButtonStyles}>전체</ToggleButton>
                            <ToggleButton value="개선전" aria-label="개선전" sx={toggleButtonStyles}>개선전</ToggleButton>
                            <ToggleButton value="개선후" aria-label="개선후" sx={toggleButtonStyles}>개선후</ToggleButton>
                        </ToggleButtonGroup>
                        <Typography gutterBottom sx={{ marginTop: 2 }}>
                            정렬순서
                        </Typography>
                        <ToggleButtonGroup
                            value={selectedSortOrder}
                            exclusive
                            onChange={handleSortOrderChange}
                            aria-label="정렬순서"
                            fullWidth
                        >
                            <ToggleButton value="최신순" aria-label="최신순" sx={toggleButtonStyles}>최신순</ToggleButton>
                            <ToggleButton value="과거순" aria-label="과거순" sx={toggleButtonStyles}>과거순</ToggleButton>
                        </ToggleButtonGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleFilterDialogClose}
                            variant="contained"
                            sx={{
                                width: '100%',
                                backgroundColor: 'var(--main-blue-color)',
                                fontWeight: 'bold',
                                height: '50px',
                                boxShadow: 'none',
                                fontSize: '1.2rem'
                            }}
                        >
                            조회
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
}
export default validationAuth(ImprovementInfo);