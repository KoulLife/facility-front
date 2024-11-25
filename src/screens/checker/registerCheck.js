import React, { useRef, useEffect, useState } from 'react';
import validationAuth from '../../validationAuth';
import {
    Container, Table, TableBody, TableCell, TableRow, Paper, Button,
    Typography, Radio, TextField, TableContainer, Box, IconButton, TableHead,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../commons/common';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import useScrolling from './useScrolling';

//점검 작성 페이지
function RegisterCheck() {
    const navigate = useNavigate();
    const cellRef = useRef(null);
    const isScrolling = useScrolling()

    const { facilityId } = useParams(); // useParams를 사용해 URL에서 facilityId를 직접 가져옴

    const [facilityName, setFacilityName] = useState(''); //시설명
    const [checkStateList, setCheckStateList] = useState([]); //점검상태값 리스트(ex정상/고장)
    const [checkItems, setCheckItems] = useState([]); //점검유형,항목set 리스트
    const [selectedState, setSelectedState] = useState({}); // 선택 점검상태값 

    const [facilityPosition, setFacilityPosition] = useState({ latitude: null, longitude: null }); //시설 좌표
    const [currentPosition, setCurrentPosition] = useState({ latitude: null, longitude: null }); //점검자 현재 위치좌표
    const [range, setRange] = useState(0); //위치 허용 반경
    const [gpsFailureCount, setGpsFailureCount] = useState(0); //gps 기반 등록 실패 카운트
    const [attemptCount, setAttemptCount] = useState(0);
    const [cellWidth, setCellWidth] = useState(0);
    const [expandedItems, setExpandedItems] = useState({});
    const [checkerNm, setCheckerNm] = useState('') //(점검자명 수정 가능하도록)
    const [files, setFiles] = useState([]); //이미지or동영상 파일 첨부
    const [isQr, setIsQr] = useState(false);
    const [summitLoading, setSummitLoading] = useState(false);

    const [status, setLoading] = useState("");

    const ScrollToTop = () => {
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        if (cellRef.current) {
            setCellWidth(cellRef.current.offsetWidth);
            setIsQr(false)
        }
    }, []);

    //점검자 이름 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            const memberId = localStorage.getItem('memberId');
            if (memberId) {
                try {
                    const url = `${common.getApiUrl()}/member/${memberId}`;
                    const accessToken = localStorage.getItem('access_token');
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    setCheckerNm(response.data.memberNm);
                } catch (error) {
                    common.handleApiError(error);
                }
            }
        };

        fetchUserData();
    }, []);

    //GPS 허용 반경값 가져오기
    const fetchRange = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(
                `${common.getApiUrl()}/common/comCd?comDtlRequest=CM5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data && Array.isArray(response.data)) {
                const rangeData = response.data.find(item => item.comDtlId === 49); // 로컬은 65, 서버는 49
                if (rangeData && rangeData.comDtlVal) {
                    setRange(parseFloat(rangeData.comDtlVal));
                } else {
                    console.error("범위데이터 찾을 수 없음:", response.data);
                }
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => value * Math.PI / 180;
        const R = 6371e3;
        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;
        return distance;
    };

    // 시설 정보 및 점검 항목 가져오기
    useEffect(() => {
        const fetchCheckItems = async () => {

            var id = facilityId;
            var qrEnter = false;

            // 점검자 qr로 접속시(qrUUID 값을 가지고 있는경우)
            if (!Number(facilityId)) {
                try {
                    const response = await axios.get(`${common.getApiUrl()}/checker/facility/${facilityId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const facilityData = response.data.data;
                    if (facilityData) {
                        id = facilityData.facilityId;
                        setIsQr(true);
                    }
                } catch (error) {
                    alert('해당 시설의 점검자가 아닙니다.')
                    navigate(`/checker`);
                }
            } else {
                try { //qr 점검시설을 url로 접속 시 돌려보내기
                    const response = await axios.get(`${common.getApiUrl()}/checker/${facilityId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (response.data) {
                        if (response.data.qrYn === 'Y') {
                            console.log("qrYn", response.data.qrYn)
                            alert('해당 시설은 QR접속 점검만 가능합니다.')
                            navigate(`/checker`);
                        }
                    }
                } catch (error) {
                    alert('잘못된 접근입니다.')
                    navigate(`/checker`);
                }
            }

            try {
                const responseFacilityInfo = await axios.get(`${common.getApiUrl()}/checker/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (responseFacilityInfo.data.facilityNm) setFacilityName(responseFacilityInfo.data.facilityNm);

                const params = {
                    facilityTypeId: responseFacilityInfo.data.facilityTypeId
                }

                if (responseFacilityInfo.data.checkItems && Array.isArray(responseFacilityInfo.data.checkItems)) {
                    setCheckItems(responseFacilityInfo.data.checkItems);
                    const checkState = await axios.get(`${common.getApiUrl()}/facility-type/check-state`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        },
                        params
                    });

                    setCheckStateList(
                        checkState.data.map(item => ({
                            checkStateId: item.facilityTypeCheckStateId,
                            checkStateNm: item.checkStateNm,
                        }))
                    );

                    //첫번째 상태값을 기본 체크값으로 설정
                    const defaultValue = {};
                    responseFacilityInfo.data.checkItems.forEach(item => {
                        if (item.textYn !== "Y") {
                            defaultValue[item.checkItemId] = checkState.data[0].checkStateNm;
                        }
                        setSelectedState(defaultValue);
                    });

                } else {
                    setCheckItems([]);
                }
                if (responseFacilityInfo.data && responseFacilityInfo.data.latitude && responseFacilityInfo.data.longitude) {
                    setFacilityPosition({
                        latitude: parseFloat(responseFacilityInfo.data.latitude),
                        longitude: parseFloat(responseFacilityInfo.data.longitude),
                    });
                } else {
                    console.error("시설 데이터를 찾을 수 없음:", responseFacilityInfo.data);
                }
            } catch (error) {
                common.handleApiError(error);
                navigate(`/checker`);
            }
        };
        ScrollToTop()
        fetchCheckItems();
        fetchRange();
    }, [facilityId]);

    //사용자 위치기반 허용 요청
    useEffect(() => {
        const requestLocationAccess = () => {
            setLoading("Locating…");
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        setCurrentPosition({
                            latitude: latitude,
                            longitude: longitude,
                        });
                        setLoading(`현재 위치: 위도(${latitude}), 경도(${longitude})`);
                        setGpsFailureCount(0); // GPS 성공 시 실패 횟수 초기화
                    },
                    (error) => {
                        console.error("사용자 위치 가져오는 중 오류 발생:", error);
                        setGpsFailureCount(prevCount => prevCount + 1);
                        common.handleApiError(error);
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                setLoading("Geolocation is not supported by browser");
                console.error("Geolocation is not supported by browser");
            }
        };

        requestLocationAccess();
    }, []);

    // 상태값 변경마다 전체값 체크되었는지 확인 - '작성완료' 버튼활성화
    useEffect(() => {
        const allChecked = areAllItemsChecked();
        const buttonElement = document.getElementById("submitButton");

        if (buttonElement) {
            buttonElement.style.backgroundColor = allChecked ? 'var(--main-blue-color)' : 'var(--sub-darkgrey-color)';
            buttonElement.disabled = !allChecked;
        }
    }, [selectedState]);

    const handleRadioChange = (id) => (event) => {
        setSelectedState({ ...selectedState, [id]: event.target.value });
    };

    const handleTextChange = (id) => (event) => {
        setSelectedState({ ...selectedState, [id]: event.target.value });
    };

    // 각 점검항목 파일 업로드
    const handleEachStateImgUpload = (item, event) => {
        const uploadedFiles = Array.from(event.target.files);
        const filePreviews = uploadedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setSelectedState(prev => ({
            ...prev,
            [`uploadFiles_${item.checkItemId}`]: [
                ...(prev[`uploadFiles_${item.checkItemId}`] || []),
                ...uploadedFiles
            ],
            [`filePreviews_${item.checkItemId}`]: [
                ...(prev[`filePreviews_${item.checkItemId}`] || []),
                ...filePreviews
            ],
        }));
    };

    // 각 항목 파일 삭제
    const handleEachStateImgRemove = (item, index) => {
        setSelectedState(prevState => {
            const updatedFiles = prevState[`uploadFiles_${item.checkItemId}`].filter((_, i) => i !== index);
            const updatedPreviews = prevState[`filePreviews_${item.checkItemId}`].filter((_, i) => i !== index);
            return {
                ...prevState,
                [`uploadFiles_${item.checkItemId}`]: updatedFiles,
                [`filePreviews_${item.checkItemId}`]: updatedPreviews,
            };
        });
    };

    // 파일 업로드
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        const filePreviews = uploadedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setFiles((prevFiles) => [...prevFiles, ...filePreviews]);
    };

    //파일 삭제
    const handleFileRemove = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const areAllItemsChecked = () => {
        return checkItems.every(item => selectedState[item.checkItemId]);
    };

    // 체크 결과 제출
    const submitResults = async () => {
        let formData = new FormData();
        setSummitLoading(true)
        setAttemptCount(prevCount => prevCount + 1);
        const filesWithoutPreview = files.map(fileObj => fileObj.file);

        if (!areAllItemsChecked()) {
            alert("모든 체크 항목을 확인해주세요.");
            setSummitLoading(false)
            return;
        }

        if (attemptCount < 1) {
            try {
                const distance = calculateDistance(
                    currentPosition.latitude,
                    currentPosition.longitude,
                    facilityPosition.latitude,
                    facilityPosition.longitude
                );

                if (distance > range) {
                    alert('점검시설 위치에서 다시 시도해주세요.');
                    setSummitLoading(false)
                    return;
                }
            } catch (error) {
                console.error("Failed to calculate distance:", error);
                alert("GPS 계산에 실패했습니다.");
                setSummitLoading(false)
                return;
            }
        }

        const checkRsltDtls = checkItems.map(item => {
            if (item.textYn === "Y") {
                return {
                    checkItemId: item.checkItemId,
                    checkItemNm: item.checkItemNm,
                    checkRsltVal: "",
                    checkRsltValNm: selectedState[item.checkItemId] || "",
                    textYn: item.textYn,
                    rm: selectedState[`rm_${item.checkItemId}`] || "",
                    dtlUploadFiles: selectedState[`uploadFiles_${item.checkItemId}`] || []
                };
            } else {
                const selectedHeader = checkStateList.find(state => state.checkStateNm === selectedState[item.checkItemId]);
                return {
                    checkItemId: item.checkItemId,
                    checkItemNm: item.checkItemNm,
                    checkRsltVal: selectedHeader ? selectedHeader.checkStateId : '',
                    checkRsltValNm: selectedState[item.checkItemId],
                    textYn: item.textYn,
                    rm: selectedState[`rm_${item.checkItemId}`] || "",
                    dtlUploadFiles: selectedState[`uploadFiles_${item.checkItemId}`] || []
                };
            }
        });

        let insertCheckRsltRequest = {
            facilityId: facilityId,
            gpsYn: attemptCount < 2 ? 'Y' : 'N',
            checkerNm: checkerNm,
            checkTime: '',
            checkRsltDtls: checkRsltDtls
        };

        const groupCd = localStorage.getItem('groupCd');
        const userId = localStorage.getItem('userId');
        if (groupCd) insertCheckRsltRequest.groupCd = groupCd;
        if (userId) insertCheckRsltRequest.id = userId;

        formData.append('insertCheckRsltRequest', new Blob([JSON.stringify(insertCheckRsltRequest)], { type: 'application/json' }));

        if (filesWithoutPreview.length > 0) {
            filesWithoutPreview.forEach(file => {
                formData.append('uploadFiles', file);
            });
        }

        checkRsltDtls.forEach((detail, index) => {
            const detailFiles = detail.dtlUploadFiles;
            if (detailFiles && detailFiles.length > 0) {
                detailFiles.forEach(file => {
                    formData.append(`checkRsltDtls[${index}].dtlUploadFiles`, file);
                });
            }
        });

        try {
            await axios.post(`${common.getApiUrl()}/checker`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (insertCheckRsltRequest.gpsYn == 'Y') {
                alert("GPS 실패. 점검결과가 강제등록되었습니다.");
            } else {
                alert("점검 등록이 완료되었습니다.");
            }
            setSummitLoading(false)
            navigate('/checker');
        } catch (error) {
            common.handleApiError(error);
            alert("점검 등록에 실패하였습니다.");
            setSummitLoading(false)
        }
    };

    const groupByCheckTypeNm = (items) => {
        return items.reduce((acc, item) => {
            if (!acc[item.checkTypeNm]) {
                acc[item.checkTypeNm] = [];
            }
            acc[item.checkTypeNm].push(item);
            return acc;
        }, {});
    };

    const groupedItems = groupByCheckTypeNm(checkItems); //점검항목명 + 체크 세트

    const toggleExpand = (checkItemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [checkItemId]: !prev[checkItemId],
        }));
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
                backgroundColor: 'var(--main-blue-color)',
                height: isScrolling ? '60px' : '170px',
                position: 'fixed',
                top: 0,
                zIndex: 1100,
                transition: 'height 0.2s ease',
            }}>
                {isQr === false ?
                    (<Box sx={{
                        position: 'absolute',
                        top: '20px',
                        left: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        padding: '0 10px 0 4px'
                    }}
                        onClick={() => navigate(-1)}
                    >
                        <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                            <ChevronLeftIcon />
                        </IconButton>
                        {!isScrolling && (
                            <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>이전</Typography>
                        )}
                    </Box>)
                    :
                    (null)
                }
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    paddingTop: isScrolling ? '0px' : '10px',
                    transition: 'padding-top 0.3s ease',
                }}>
                    <Typography variant="h4" sx={{
                        fontSize: isScrolling ? '1.2rem' : '1.8rem',
                        transition: 'font-size 0.3s ease',
                        textAlign: 'center'
                    }}>
                        {facilityName}
                    </Typography>
                </Box>
            </Box>
            <Container maxWidth="lg" sx={{
                padding: '0',
                flexGrow: 1,
                marginBottom: '10px',
                marginTop: isScrolling ? '120px' : '170px',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 17px',
                    color: '#696969',
                    marginTop: '10px',
                }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                        작성일시 : {new Date().toLocaleString('ko-KR', {
                            timeZone: 'Asia/Seoul',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }).replace('.', '년 ').replace('.', '월 ').replace('.', '일 ').replace(/:.. /, ' ')}
                    </Typography>
                </Box>
                {Object.entries(groupedItems).length === 0 && (
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: '4px',
                        boxShadow: 'none'
                    }}>
                        <Typography variant="body1" align="center">
                            점검 항목이 없습니다.
                        </Typography>
                    </Box>
                )}
                {Object.entries(groupedItems).map(([checkTypeNm, items]) => (
                    <Box key={checkTypeNm} sx={{ overflow: 'visible' }}>
                        {Object.entries(groupedItems).length > 0 && (
                            <TableContainer
                                component={Paper}
                                sx={{
                                    mt: 2,
                                    pt: 1,
                                    pr: 1,
                                    pl: 1,
                                    overflow: 'visible',
                                    borderRadius: '18px',
                                    boxShadow: 'none',
                                }}
                            >
                                <Box sx={{
                                    padding: '5px',
                                    marginBottom: '10px',
                                }}>
                                    {/* 점검유형명 */}
                                    <Typography variant="h5"
                                        sx={{ fontWeight: 'bold', fontSize: '1.6rem' }}>
                                        {checkTypeNm}
                                    </Typography>
                                </Box>
                                <Table>
                                    {items.find(item => item.textYn == 'N') ? (<TableHead >
                                        <TableCell sx={{ borderBottom: '1px solid #696969' }}></TableCell>
                                        <TableCell sx={{ padding: 0, borderBottom: '1px solid #696969' }}>
                                            <Box sx={{
                                                display: 'flex',
                                                padding: '0',
                                                justifyContent: 'space-between',
                                            }}>
                                                {checkStateList.map((state) => (
                                                    <Box key={state.checkStateId} sx={{ textAlign: 'center', flex: '1' }}>
                                                        <Typography variant="body2"
                                                            sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                                            {state.checkStateNm}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #696969', padding: '0' }}></TableCell>
                                    </TableHead>) : (null)}

                                    <TableBody sx={{ borderTop: '1px solid #696969' }}>
                                        {items.length > 0 ? (
                                            items.map((item, index) => {
                                                const isLastItem = index === items.length - 1;
                                                const isExpanded = expandedItems[item.checkItemId];
                                                return (
                                                    <>
                                                        <React.Fragment key={item.checkItemId}>
                                                            <TableRow>
                                                                <TableCell component="th" scope="row" ref={cellRef}
                                                                    sx={{
                                                                        fontSize: '1.1rem',
                                                                        paddingX: '2px',
                                                                        textAlign: 'left',
                                                                        fontWeight: 'bold',
                                                                        width: '40%',
                                                                    }}>
                                                                    <span>{item.checkItemNm}</span>
                                                                </TableCell>
                                                                <TableCell align="center" sx={{
                                                                    paddingX: '0px',
                                                                    pt: '5px',
                                                                    pb: '5px',
                                                                    position: 'relative'
                                                                }}>
                                                                    {item.textYn === "Y" ? (
                                                                        <TextField
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            size="small"
                                                                            autoComplete="off"
                                                                            value={selectedState[item.checkItemId] || ""}
                                                                            onChange={handleTextChange(item.checkItemId)}
                                                                            sx={{ paddingRight: 2 }}
                                                                        />
                                                                    ) : (
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            width: '100%',
                                                                        }}>
                                                                            {checkStateList.map(state => (
                                                                                <Box key={state.checkStateId}
                                                                                    sx={{
                                                                                        flex: '1',
                                                                                        display: 'flex',
                                                                                        justifyContent: 'center'
                                                                                    }}>
                                                                                    <Radio
                                                                                        checked={selectedState[item.checkItemId] === state.checkStateNm}
                                                                                        onChange={handleRadioChange(item.checkItemId)}
                                                                                        value={state.checkStateNm || ''}
                                                                                        name={item.checkItemId + '-radio'}
                                                                                        sx={{ transform: 'scale(0.8)' }}
                                                                                    />
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ paddingX: '0px' }}>
                                                                    {!isExpanded && (
                                                                        <Box sx={{
                                                                            height: '25px',
                                                                            width: '25px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            cursor: 'pointer'
                                                                        }} onClick={() => toggleExpand(item.checkItemId)}>
                                                                            <EditOutlinedIcon sx={{ color: '#57A6E4', fontSize: '17px' }} />
                                                                        </Box>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                            {isExpanded && (
                                                                <TableRow>
                                                                    <TableCell colSpan={3} sx={{ padding: '10px 10px 20px 10px', position: 'relative', }}>
                                                                        <Box sx={{ display: 'flex' }}>
                                                                            <TextField
                                                                                fullWidth
                                                                                variant="outlined"
                                                                                size="small"
                                                                                multiline
                                                                                rows={2}
                                                                                autoComplete="off"
                                                                                placeholder="특이사항을 입력하세요."
                                                                                value={selectedState[`rm_${item.checkItemId}`] || ""}
                                                                                onChange={(e) => setSelectedState(prev => ({
                                                                                    ...prev,
                                                                                    [`rm_${item.checkItemId}`]: e.target.value
                                                                                }))}
                                                                                sx={{ paddingRight: 1, width: '75%' }}
                                                                            />
                                                                            <Button variant="contained" component="label" sx={{ width: '25%' }}>
                                                                                사진 첨부
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    multiple
                                                                                    hidden
                                                                                    onChange={(e) => handleEachStateImgUpload(item, e)}
                                                                                />
                                                                            </Button>
                                                                        </Box>
                                                                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
                                                                            {selectedState[`filePreviews_${item.checkItemId}`]?.map((fileObj, index) => (
                                                                                <div key={index} style={{ marginBottom: '10px', position: 'relative', marginRight: '15px' }}>
                                                                                    {fileObj.file.type.startsWith('image/') && (
                                                                                        <img
                                                                                            src={fileObj.preview}
                                                                                            alt="미리보기"
                                                                                            style={{ width: '150px', height: 'auto' }}
                                                                                        />
                                                                                    )}
                                                                                    {fileObj.file.type.startsWith('video/') && (
                                                                                        <video
                                                                                            src={fileObj.preview}
                                                                                            width="150"
                                                                                            height="auto"
                                                                                            controls
                                                                                        />
                                                                                    )}
                                                                                    <IconButton
                                                                                        onClick={() => handleEachStateImgRemove(item, index)}
                                                                                        style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                                                                                        size="large"
                                                                                    >
                                                                                        X
                                                                                    </IconButton>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <Box sx={{
                                                                            position: 'absolute',
                                                                            bottom: '0px',
                                                                            right: '-10px',
                                                                            backgroundColor: '#fff',
                                                                            border: '1px solid #ddd',
                                                                            width: '25px',
                                                                            height: '25px',
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            cursor: 'pointer'
                                                                        }} onClick={() => toggleExpand(item.checkItemId)}>
                                                                            <RemoveIcon sx={{ color: '#57A6E4', fontSize: '17px' }} />
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </React.Fragment>
                                                    </>
                                                );
                                            })
                                        ) : (
                                            <Box sx={{
                                                mt: 2,
                                                p: 2,
                                                borderRadius: '4px',
                                                boxShadow: 'none'
                                            }}>
                                                <Typography variant="body1" align="center">
                                                    점검 항목이 없습니다.
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                ))}
                <Box
                    component={Paper}
                    sx={{
                        p: '10px 20px',
                        height: '70px',
                        mt: 2,
                        borderRadius: '18px',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                    }}
                >
                    <Box sx={{ width: '30%' }}>점검자</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            value={checkerNm}
                            onChange={(e) => setCheckerNm(e.target.value)}
                            fullWidth
                        />
                    </Box>
                </Box>
                <Box
                    component={Paper}
                    sx={{
                        p: '10px 20px',
                        minHeight: '70px',
                        mt: 2,
                        mb: '15vh',
                        boxSizing: 'border-box',
                        borderRadius: '18px',
                        boxShadow: 'none',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                    }}>
                        <Box sx={{ width: '30%' }}>파일 업로드</Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button variant="contained" component="label" sx={{ borderRadius: '20px', padding: '10px 30px' }}>
                                파일 선택
                                <input
                                    type="file"
                                    accept="image/*, video/*"
                                    multiple
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <div style={{ marginTop: '10px' }}>
                            {files.map((fileObj, index) => (
                                <div key={index} style={{ marginBottom: '10px', position: 'relative' }}>
                                    {fileObj.file.type.startsWith('image/') && (
                                        <img
                                            src={fileObj.preview}
                                            alt="미리보기"
                                            style={{ width: '150px', height: 'auto' }}
                                        />
                                    )}
                                    {fileObj.file.type.startsWith('video/') && (
                                        <video
                                            src={fileObj.preview}
                                            width="150"
                                            height="auto"
                                            controls
                                        />
                                    )}
                                    <Button
                                        onClick={() => handleFileRemove(index)}
                                        style={{ position: 'absolute', top: 0, color: 'red' }}
                                        size="small"
                                    >
                                        삭제
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Box>
                </Box>
            </Container>
            {Object.keys(groupedItems).length > 0 && (
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
                        sx={{ minHeight: '8vh', maxWidth: '600px', fontSize: '1.3rem', boxShadow: 'none', borderRadius: '30px' }}
                        disabled={summitLoading}
                        onClick={submitResults}
                    >
                        작성완료
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default validationAuth(RegisterCheck);