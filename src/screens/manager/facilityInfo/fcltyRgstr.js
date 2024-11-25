import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Button, FormControl, Grid, InputLabel, Checkbox,
    MenuItem, Select, TextField, Typography, Dialog, Divider,
    DialogActions, DialogContent, DialogTitle, RadioGroup, FormControlLabel, Radio, Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../../commons/common';
import ImageUpload from '../../../images/image_upload.png';
import AlertForConfirm from '../../../components/alertForConfirm';

function FacilityRegistration() {
    const navigate = useNavigate();
    const { handleSubmit } = useForm();
    const [alertMsg, setAlertMsg] = useState('');

    const [facilityTypes, setFacilityTypes] = useState([]); //시설유형 리스트
    const [checkCycles, setCheckCycles] = useState([]); //점검주기 리스트
    const [deptList, setDeptList] = useState([]); //전체 부서 리스트
    const [userOrgData, setUserOrgData] = useState({}); //로그인 사용자 부서정보

    //기본정보
    const [selectedFacilityTypeId, setSelectedFacilityTypeId] = useState('');
    const [selectedPath, setSelectedPath] = useState(''); //선택 부서 Tier Path 표출
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [selectedCheckCycleCode, setSelectedCheckCycleCode] = useState('');
    const [isQrCheck, setIsQrCheck] = useState(false); //qr 점검 여부

    //추가 관리항목
    const [facilityAddItems, setFacilityAddItems] = useState([
        {
            addItemNm: '',
            addItemDtlNm: '',
            facilityTypeAddItemDtls: [],
            addItemVal: '',
            facilityTypeAddItemId: '',
        }
    ]);

    //점검항목
    const [checkTypeOptions, setCheckTypeOptions] = useState([]); //시설유형별 점검유형 리스트
    const [checkItems, setCheckItems] = useState([]); //점검유형,질문 리스트

    const [openDeptAssignModal, setOpenDeptAssignModal] = useState(false);
    const [showAdditionalItemAlert, setShowAdditionalItemAlert] = useState(false);

    const [openFetchDialog, setOpenFetchDialog] = useState(false); //점검항목 초기화 컨펌
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [showNoCheckTypeAlert, setShowNoCheckTypeAlert] = useState(false);

    const [newfacilityInfo, setNewFacilityInfo] = useState({
        facilityType: '', //시설유형 id(전송시 integer변환)
        facilityNm: '', //시설명
        latitude: '', //위도
        longitude: '', //경도
        checkCycle: '', //점검주기
        qrYn: 'N',
        facilityAddItems: [], //추가관리항목
        checkItems: [], //점검항목
        topDeptId: '',
        topDeptNm: '',
        midDeptId: '',
        midDeptNm: '',
        botDeptId: '',
        botDeptNm: '',
    });

    useEffect(() => {
        fetchUserOrgData();
        fetchFacilityTypes();
        fetchCheckCycleList();
    }, []);

    //시설유형 리스트 가져오기
    const fetchFacilityTypes = async () => {
        try {
            const response = await axios.get(
                `${common.getApiUrl()}/facility-type`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
            if (response.status === 200) {
                setFacilityTypes(response.data);
            } else {
                console.error("No facility types found or bad data:",
                    response.data);
            }
        } catch (error) {
            console.error("Failed to fetch facility types:", error);
        }
    }

    //점검주기 리스트 가져오기
    const fetchCheckCycleList = async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/common/code/CheckCycle`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
            if (response.status === 200) {
                const fetchedItems = response.data.map((item) => ({
                    code: item.code,
                    title: item.title,
                }));
                setCheckCycles(fetchedItems);
            }
        } catch (error) {
            console.error("Failed to fetch CheckCylces:", error);
        }
    }

    //사용자 정보 가져오기 (등록하는 사용자 조직으로 시설이 들어감)
    const fetchUserOrgData = async () => {
        const memberId = localStorage.getItem('memberId');
        if (memberId) {
            try {
                const url = `${common.getApiUrl()}/member/${memberId}`;
                const accessToken = localStorage.getItem('access_token');
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.data) {
                    const dept = response.data.dept || [];
                    const deptInfo = {
                        lastDeptLevel: response.data.lastDeptLevel,
                        topDeptId: dept[0] ? String(dept[0].deptId) : "",
                        topDeptNm: dept[0] ? dept[0].deptNm : "",
                        midDeptId: dept[1] ? String(dept[1].deptId) : "",
                        midDeptNm: dept[1] ? dept[1].deptNm : "",
                        botDeptId: dept[2] ? String(dept[2].deptId) : "",
                        botDeptNm: dept[2] ? dept[2].deptNm : "",
                    };

                    setUserOrgData(deptInfo);
                    setNewFacilityInfo(prev => ({
                        ...prev,
                        topDeptId: dept[0] ? String(dept[0].deptId) : "",
                        topDeptNm: dept[0] ? dept[0].deptNm : "",
                        midDeptId: dept[1] ? String(dept[1].deptId) : "",
                        midDeptNm: dept[1] ? dept[1].deptNm : "",
                        botDeptId: dept[2] ? String(dept[2].deptId) : "",
                        botDeptNm: dept[2] ? dept[2].deptNm : "",
                    }));
                }

                // 두 번째 API 호출 (전체 부서 데이터 가져오기)
                const deptResponse = await axios.get(`${common.getApiUrl()}/dept/all`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (deptResponse.data) {
                    const allDept = deptResponse.data.map(item => ({
                        deptId: String(item.deptId),
                        deptNm: item.deptNm,
                        deptType: item.deptType,
                        deptLevel: item.deptLevel,
                        upperDept: item.upperDept
                    }));
                    setDeptList(allDept);
                }
            } catch (error) {
                common.handleApiError(error);
                setAlertMsg('데이터를 가져오는데 실패했습니다.');
            }
        }
    };

    const handleFacilityTypeChange = (event) => {
        setSelectedFacilityTypeId(event.target.value)
    }

    //시설유형 선택 추적
    useEffect(() => {
        const handleFacilityTypeChange = async () => {
            if (selectedFacilityTypeId) {
                setNewFacilityInfo(prev => ({
                    ...prev,
                    facilityType: selectedFacilityTypeId
                }));
                fetchFacilityAddItems(selectedFacilityTypeId); //추가항목 불러오기
                fetchCheckTypes(selectedFacilityTypeId); //점검항목 불러오기
                setCheckItems([]); //점검항목 작성부분 초기화
            } else {
                setNewFacilityInfo(prev => ({
                    ...prev,
                    facilityType: ''
                }));
                setFacilityAddItems([]);
                setCheckTypeOptions([]);
                setCheckItems([]);
            }
        };
        handleFacilityTypeChange();
    }, [selectedFacilityTypeId])

    //시설명 변경
    const handleChangeFactilityNm = (event) => {
        const { name, value } = event.target;
        setNewFacilityInfo(prev => ({ ...prev, [name]: value }));
    };

    //시설 사진 선택
    const handleImageFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = function (e) {
                setImagePreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    //시설 사진 삭제 (구현 예정)
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl('');
    };

    //관리처 선택 모달 open
    const handleOpenDeptAssignModal = () => setOpenDeptAssignModal(true);

    //관리처 선택 모달 close
    const handleCloseDeptModal = () => {
        setOpenDeptAssignModal(false);
        setAlertMsg('')
    };

    //관리처 모달에서 Tier 변경 작업
    const handleFacilityDeptChange = (event, deptLevel) => {
        const selectedDeptId = String(event.target.value);
        const selectedDeptNm = deptList.find(item => String(item.deptId) === selectedDeptId)?.deptNm || "";

        if (deptLevel === 2) {
            setNewFacilityInfo(prev => ({
                ...prev,
                midDeptId: selectedDeptId,
                midDeptNm: selectedDeptNm
            }));
        } else if (deptLevel === 3) {
            setNewFacilityInfo(prev => ({
                ...prev,
                botDeptId: selectedDeptId,
                botDeptNm: selectedDeptNm
            }));
        }
    };

    //관리처 선택 모달 저장 클릭
    const handleAssignDept = () => {
        if (!newfacilityInfo.midDeptId || !newfacilityInfo.botDeptId) {
            setAlertMsg('관리처 조직을 선택해주세요.');
            return;
        }

        if (userOrgData.topDeptId && userOrgData.midDeptId && userOrgData.botDeptId) {
            const departments = [newfacilityInfo.topDeptNm, newfacilityInfo.midDeptNm, newfacilityInfo.botDeptNm].filter(Boolean);
            const path = departments.join(" - ");
            setSelectedPath(path);
        }
        handleCloseDeptModal();
    };

    //관리처 변경 시 표출 path
    useEffect(() => {
        const departments = [newfacilityInfo.topDeptNm, newfacilityInfo.midDeptNm, newfacilityInfo.botDeptNm].filter(Boolean);
        const path = departments.join(" - ");
        setSelectedPath(path);
    }, [userOrgData, newfacilityInfo])

    //점검주기
    const handleCheckCycleChange = (event) => {
        setSelectedCheckCycleCode(event.target.value)
    }

    //위도 입력
    const handleLatitudeChange = (event) => {
        const value = event.target.value;
        const maskedValue = value
            .replace(/[^0-9.-]/g, '')
            .replace(/(?!^-)-/g, '')
            .replace(/(\..*?)\..*/g, '$1')
            .replace(/^(-?\d{2})(\d)/, '$1.$2');
        setNewFacilityInfo((prev) => ({ ...prev, latitude: maskedValue }));
    };

    //경도 입력
    const handleLongitudeChange = (event) => {
        const value = event.target.value;
        const maskedValue = value
            .replace(/[^0-9.-]/g, '')
            .replace(/(?!^-)-/g, '')
            .replace(/(\..*?)\..*/g, '$1')
            .replace(/^(-?\d{3})(\d)/, '$1.$2');
        setNewFacilityInfo((prev) => ({ ...prev, longitude: maskedValue }));
    };

    //QR점검 체크
    const handleQrCheck = (event) => {
        setIsQrCheck(event.target.checked);
    };

    //시설유형별 추가항목
    const fetchFacilityAddItems = async (facilityTypeId) => {
        try {
            const response = await axios.get(
                `${common.getApiUrl()}/facility-type/add-item`, {
                params: { facilityTypeId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.status === 200) {
                setFacilityAddItems(response.data);
            } else {
                console.error("No facility add items found or bad data:", response.data);
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch facility add items:', error);
            return [];
        }
    };

    //추가 관리항목 onChange
    const handleAddItemChange = (event, facilityTypeAddItemId) => {
        const { value } = event.target;

        const updatedItems = facilityAddItems.map(item => {
            if (item.facilityTypeAddItemId === facilityTypeAddItemId) {
                return {
                    ...item,
                    addItemVal: value,
                };
            } else return item;
        })
        setFacilityAddItems(updatedItems);
    };

    //시설유형별 점검유형 가져오기
    const fetchCheckTypes = async (facilityTypeId) => {
        try {
            const response = await axios.get(
                `${common.getApiUrl()}/facility-type/check-type`, {
                params: { facilityTypeId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setCheckTypeOptions(response.data);
        } catch (error) {
            console.error('Failed to fetch check types:', error);
            return [];
        }
    };

    //시설유형 점검항목 불러오기 클릭
    const handlClickGetCheckItems = async () => {
        if (!selectedFacilityTypeId) {
            setShowAdditionalItemAlert(true);
            return;
        }
        
        if (checkItems.length > 0) {
            setOpenFetchDialog(true); //점검항목 초기화 컨펌
            return;
        }

        if(!checkTypeOptions.length > 0){
            setShowNoCheckTypeAlert(true)
            return;
        }

        await fetchCheckItemSet();
    };

    //시설유형 점검항목 불러오기 컨펌
    const handleConfirmFetch = async () => {
        setOpenFetchDialog(false);
        await fetchCheckItemSet();
    };

    //시설유형 점검항목/질문 리스트(통합관리자 미리 설정)
    const fetchCheckItemSet = async () => {
        if (!selectedFacilityTypeId) return;

        try {
            const response = await axios.get(
                `${common.getApiUrl()}/facility-type/check-item`, {
                params: { facilityTypeId: selectedFacilityTypeId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            const checkItems = response.data || [];
            const items = checkTypeOptions.flatMap(type => {
                const relatedItems = checkItems.filter(item => item.checkTypeId === type.checkTypeId);

                if (relatedItems.length > 0) {
                    return relatedItems.map(item => ({
                        facilityTypeId: selectedFacilityTypeId,
                        facilityType: facilityTypes.find(facility => facility.id === selectedFacilityTypeId)?.name,
                        checkTypeId: type.checkTypeId,
                        checkTypeNm: type.checkTypeNm,
                        facilityTypeCheckItemId: item.facilityTypeCheckItemId,
                        checkItemNm: item.checkItemNm,
                        textYn: item.textYn
                    }));
                } else {
                    // checkItem이 없는 점검유형이면 빈 item으로 객체 생성
                    return {
                        facilityTypeId: selectedFacilityTypeId,
                        facilityType: facilityTypes.find(facility => facility.id === selectedFacilityTypeId)?.name,
                        checkTypeId: type.checkTypeId,
                        checkTypeNm: type.checkTypeNm,
                        facilityTypeCheckItemId: "",
                        checkItemNm: "",
                        textYn: ""
                    };
                }
            });

            setCheckItems(items.length > 0 ?
                items.map(item => ({ ...item, textYn: 'N' })) :
                [{
                    facilityTypeCheckItemId: 0,
                    checkTypeId: 0,
                    checkTypeNm: '',
                    checkItemNm: '',
                    textYn: 'N',
                }]);
        } catch (error) {
            console.error('Failed to fetch check items:', error);
        }
    };

    //점검항목 그리드 행 추가
    const handleAddCheckItem = () => {
        if (!selectedFacilityTypeId) {
            setShowAdditionalItemAlert(true)
            return;
        }

        if (!checkTypeOptions.length > 0){
            setShowNoCheckTypeAlert(true)
            return;
        }
        setCheckItems([
            ...checkItems,
            { checkTypeNm: '', checkItemNm: '', checkTypeId: 0, textYn: 'N' }
        ]);
    };

    //점검항목 그리드 행 삭제
    const handleRemoveCheckItem = (index) => {
        setCheckItems(checkItems.filter((_, i) => i !== index));
    };

    //점검항목에서 점검유형 변경
    const handleCheckTypeChange = (event, index) => {
        const checkTypeId = event.target.value;
        const selectedCheckType = checkTypeOptions.find(option => option.checkTypeId === checkTypeId);

        setCheckItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        checkTypeNm: selectedCheckType.checkTypeNm,
                        checkTypeId: checkTypeId
                    }
                    : item
            )
        );
    };

    //페이지 떠나기 경고
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        const handleWindowClose = (event) => {
            if (!window.confirm('시설등록을 취소하시겠습니까?')) {
                event.preventDefault();
                return;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handleWindowClose);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handleWindowClose);
        };
    }, []);

    //등록 로직
    const onSubmit = async () => {
        const payload = new FormData();

        const updatedCheckItems = [
            ...checkItems.map(item => ({
                checkTypeId: item.checkTypeId,
                checkItemNm: item.checkItemNm,
                textYn: item.textYn
            }))
        ];

        const hasEmptyCheckItem = checkItems.some(item => !item.checkItemNm);
        if (hasEmptyCheckItem) {
            alert('점검질문을 모두 입력해주세요.');
            return;
        }

        if (!newfacilityInfo.botDeptId) {
            alert('관리처를 선택해주세요.')
            return;
        }

        const insertFacilityRequest = {
            facilityType: parseInt(newfacilityInfo.facilityType) || 0,
            facilityNm: newfacilityInfo.facilityNm || "",
            topDeptId: parseInt(newfacilityInfo.topDeptId),
            topDeptNm: newfacilityInfo.topDeptNm,
            midDeptId: parseInt(newfacilityInfo.midDeptId),
            midDeptNm: newfacilityInfo.midDeptNm,
            botDeptId: parseInt(newfacilityInfo.botDeptId),
            botDeptNm: newfacilityInfo.botDeptNm,
            latitude: newfacilityInfo.latitude || "",
            longitude: newfacilityInfo.longitude || "",
            qrYn : isQrCheck ? 'Y' : 'N',
            checkCycle: selectedCheckCycleCode,
            facilityAddItems: facilityAddItems,
            checkItems: updatedCheckItems
        };

        payload.append('insertFacilityRequest', new Blob([JSON.stringify(insertFacilityRequest)], { type: "application/json" }));
        if (imageFile) payload.append('uploadFile', imageFile);

        try {
            const response = await axios.post(`${common.getApiUrl()}/facility`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.data) {
                alert("새 시설이 등록되었습니다.");
            } else {
                alert("실패하였습니다. 관리자에게 문의하세요");
            }
            navigate('/manager/facility-info', { replace: true });
        } catch (error) {
            alert("필수 입력값을 모두 입력해주세요.");
            console.error("Registration failed", error.response || error.message);
        }
    };

    const handleCancel = () => setOpenCancelDialog(true);
    const handleConfirmCancel = () => navigate(-1);

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                backgroundColor: 'white',
                p: 2,
                borderRadius: 1,
                mb: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 1.5, }}>기본정보</Typography>
                <Box sx={{
                    border: '2px solid #9B9B9B',
                    borderRadius: 2,
                    p: 3,
                    mb: 3,
                }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3} sx={{ pr: 3 }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 200,
                                    backgroundColor: '#F4F4F4',
                                    border: '1px #9B9B9B',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('raised-button-file').click()}  // 클릭 시 파일 입력 창 열기
                            >
                                {!imagePreviewUrl && (
                                    <>
                                        <Box
                                            component="img"
                                            src={ImageUpload}
                                            alt="이미지 업로드"
                                            sx={{ width: 85, height: 85 }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#9B9B9B', fontSize: '0.6rem' }}>
                                            사진을 올리시려면 이곳을 클릭하세요.
                                        </Typography>
                                    </>
                                )}
                                {imagePreviewUrl && (
                                    <>
                                        <img src={imagePreviewUrl} alt="Preview"
                                            style={{ marginBottom: '20px', maxWidth: '100%', maxHeight: '200px' }} />
                                    </>
                                )}
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={handleImageFileChange}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                    <Typography
                                        sx={{ width: 120, fontWeight: 'bold', textAlign: 'left' }}>*시설유형</Typography>
                                    <FormControl size="small" sx={{ width: 200 }}>
                                        <Select
                                            value={selectedFacilityTypeId || ''}
                                            onChange={handleFacilityTypeChange}
                                        >
                                            {facilityTypes.map(type => (
                                                <MenuItem key={type.facilityTypeId} value={type.facilityTypeId}>
                                                    {type.facilityTypeNm}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                                    <Typography
                                        sx={{ width: 120, fontWeight: 'bold', textAlign: 'left' }}>*시설명</Typography>
                                    <TextField variant="outlined" size="small"
                                        sx={{ width: 'calc(100% - 120px)' }}
                                        name='facilityNm'
                                        autoComplete="off"
                                        value={newfacilityInfo.facilityNm}
                                        onChange={handleChangeFactilityNm} />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                                    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                                        <Grid item xs={7}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
                                                <Typography sx={{ width: 120, fontWeight: 'bold', textAlign: 'left' }}>*관리처</Typography>
                                                <Box
                                                    sx={{
                                                        height: 40,
                                                        width: 'calc(100% - 120px)',
                                                        backgroundColor: '#fff',
                                                        color: 'rgba(0, 0, 0, 0.54)',
                                                        textTransform: 'none',
                                                        border: '1px solid #ccc',
                                                        boxShadow: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        pl: 2,
                                                        fontWeight: 400,
                                                        fontSize: '1rem',
                                                        letterSpacing: '0.00938em',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5',
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                    onClick={handleOpenDeptAssignModal}
                                                >
                                                    {selectedPath || "관리처 선택"}
                                                </Box>
                                            </Box>
                                            <Dialog
                                                open={openDeptAssignModal}
                                                onClose={handleCloseDeptModal}
                                                aria-labelledby="alert-dialog-title"
                                                aria-describedby="alert-dialog-description"
                                                fullWidth={true}
                                                maxWidth="sm"
                                                PaperProps={{
                                                    style: {
                                                        maxHeight: '450px',
                                                        overflow: 'auto'
                                                    }
                                                }}
                                            >
                                                <DialogTitle>관리처 선택</DialogTitle>
                                                <DialogContent>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel id="tier1">관리본부</InputLabel>
                                                        <Select
                                                            labelId="tier1"
                                                            value={newfacilityInfo.topDeptId}
                                                            label="관리본부"
                                                            disabled
                                                        >
                                                            <MenuItem value={userOrgData.topDeptId}>{userOrgData.topDeptNm}</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel id="tier2">관리부서</InputLabel>
                                                        <Select
                                                            labelId="tier2"
                                                            value={String(newfacilityInfo.midDeptId)}
                                                            label="관리부서"
                                                            onChange={(event) => handleFacilityDeptChange(event, 2)}
                                                            disabled={userOrgData.lastDeptLevel === 0 || userOrgData.lastDeptLevel === 2 || userOrgData.lastDeptLevel === 3}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === parseInt(newfacilityInfo.topDeptId)).length > 0 ? (
                                                                deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === parseInt(newfacilityInfo.topDeptId)).map((item) => (
                                                                    <MenuItem key={item.deptId} value={item.deptId}>
                                                                        {item.deptNm}
                                                                    </MenuItem>
                                                                ))
                                                            ) : (
                                                                <MenuItem disabled>조직이 없습니다.</MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel id="tier3">팀</InputLabel>
                                                        <Select
                                                            labelId="tier3"
                                                            value={String(newfacilityInfo.botDeptId)}
                                                            label="팀"
                                                            onChange={(event) => handleFacilityDeptChange(event, 3)}
                                                            disabled={userOrgData.lastDeptLevel === 0 || userOrgData.lastDeptLevel === 3}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === parseInt(newfacilityInfo.midDeptId)).length > 0 ? (
                                                                deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === parseInt(newfacilityInfo.midDeptId)).map((item) => (
                                                                    <MenuItem key={item.deptId} value={item.deptId}>
                                                                        {item.deptNm}
                                                                    </MenuItem>
                                                                ))
                                                            ) : (!newfacilityInfo.midDeptId ? (<MenuItem disabled>관리부서를 먼저 선택해주세요</MenuItem>) : (<MenuItem disabled>조직이 없습니다</MenuItem>)
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                </DialogContent>
                                                {alertMsg && (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        {alertMsg}
                                                    </Alert>
                                                )}
                                                <DialogActions>
                                                    <Button
                                                        variant="contained"
                                                        disableRipple
                                                        disableElevation
                                                        sx={{
                                                            width: '100%',
                                                            '&:hover': { backgroundColor: '#1E88E5' },
                                                        }}
                                                        onClick={handleAssignDept}
                                                    >
                                                        선택
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography
                                                    sx={{ width: 120, fontWeight: 'bold', textAlign: 'center' }}>*점검주기</Typography>
                                                <FormControl size="small" sx={{ width: 'calc(100% - 120px)', }}>
                                                    <Select
                                                        value={selectedCheckCycleCode || ''}
                                                        onChange={handleCheckCycleChange}
                                                    >
                                                        {checkCycles.map((cycle) => (
                                                            <MenuItem key={cycle.code} value={cycle.code}>
                                                                {cycle.title}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                                    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                                        <Grid item xs={7}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                                <Typography sx={{ width: 120, fontWeight: 'bold', textAlign: 'left' }}>시설 좌표</Typography>
                                                <Box sx={{ width: 'calc(100% - 120px)', display: 'flex', }}>
                                                    <TextField
                                                        sx={{ mr: '10px' }}
                                                        variant="outlined"
                                                        size="small"
                                                        name='latitude'
                                                        placeholder="위도"
                                                        autoComplete="off"
                                                        value={newfacilityInfo.latitude}
                                                        onChange={handleLatitudeChange}
                                                    />
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        name="longitude"
                                                        placeholder="경도"
                                                        autoComplete="off"
                                                        value={newfacilityInfo.longitude}
                                                        onChange={handleLongitudeChange}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                                                <Typography sx={{ width: 120, fontWeight: 'bold', textAlign: 'center' }}>QR 점검</Typography>
                                                <Checkbox
                                                    checked={isQrCheck}
                                                    onChange={handleQrCheck}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                                {isQrCheck && (
                                    <Alert severity="info">QR 접속을 통한 점검만 가능합니다.</Alert>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 1.5, }}>시설유형별 추가항목</Typography>
                <Box sx={{
                    border: '2px solid #9B9B9B',
                    borderRadius: 2,
                    p: 2,
                    mb: 4,
                }}>
                    {/* 추가 관리항목 */}
                    {newfacilityInfo.facilityType ? (
                        facilityAddItems.length > 0 ? (
                            facilityAddItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography sx={{ width: 150, fontWeight: 'bold' }}>{item.addItemNm}</Typography>
                                    {item.facilityTypeAddItemDtls && item.facilityTypeAddItemDtls.length > 0 ? ( //선택옵션 관리항목이면
                                        <FormControl fullWidth size="small">
                                            <InputLabel id={`select-label-${index}`}>선택</InputLabel>
                                            <Select
                                                labelId={`select-label-${index}`}
                                                value={item.addItemVal || ''}
                                                onChange={(e) => handleAddItemChange(e, item.facilityTypeAddItemId)}
                                                label="선택"
                                            >
                                                {item.facilityTypeAddItemDtls.map((detail) => (
                                                    <MenuItem key={detail.facilityTypeAddItemDtlId} value={detail.facilityTypeAddItemDtlId}>
                                                        {detail.addItemDtlNm}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="입력"
                                            variant="outlined"
                                            autoComplete="off"
                                            value={item.addItemVal || ''}
                                            onChange={(e) => handleAddItemChange(e, item.facilityTypeAddItemId)}
                                        />
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography sx={{ textAlign: 'center', color: '#9B9B9B' }}>추가 관리항목이 없습니다</Typography>
                        )
                    ) : (
                        <Typography sx={{ textAlign: 'center', color: '#9B9B9B' }}>시설유형을 선택해주세요</Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 1.5, }}>점검항목</Typography>
                    <Button
                        variant="contained"
                        sx={{
                            position: 'relative',
                            bottom: '5px',
                            backgroundColor: 'var(--sub-darkblue-color)',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'var(--sub-darkblue-color)',
                                boxShadow: 'none',
                            }
                        }}
                        onClick={handlClickGetCheckItems}
                    >
                        시설유형 점검항목 불러오기
                    </Button>
                </Box>
                <Box sx={{
                    border: '2px solid #9B9B9B',
                    borderRadius: 2,
                    p: 2
                }}>
                    {checkItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 3 }}>
                                <Box sx={{ width: '20%', display: 'flex', alignItems: 'center', mr: 3 }}>
                                    <Typography sx={{ mr: 2, flexShrink: 0, fontWeight: 'bold' }}>점검유형</Typography>
                                    <FormControl size="small" sx={{ width: '100%' }}>
                                        <Select displayEmpty
                                            value={item.checkTypeId}
                                            onChange={(event) => handleCheckTypeChange(event, index)}
                                        >
                                            {checkTypeOptions.map((option) => (
                                                <MenuItem key={option.checkTypeId} value={option.checkTypeId}>
                                                    {option.checkTypeNm}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ width: '40%', display: 'flex', alignItems: 'center', mr: 3 }}>
                                    <Typography sx={{ mr: 2, flexShrink: 0, fontWeight: 'bold' }}>점검질문</Typography>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        placeholder="점검질문"
                                        autoComplete="off"
                                        value={item.checkItemNm || ''}
                                        onChange={(event) => {
                                            const updatedCheckItems = checkItems.map(
                                                (checkItem, i) =>
                                                    i === index
                                                        ? {
                                                            ...checkItem,
                                                            checkItemNm: event.target.value
                                                        }
                                                        : checkItem
                                            );
                                            setCheckItems(updatedCheckItems);
                                        }}
                                    />
                                </Box>
                                <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', ml: 6 }}>
                                    <Typography sx={{ mr: 4, flexShrink: 0, fontWeight: 'bold' }}>입력방식</Typography>
                                    <RadioGroup
                                        row
                                        value={item.textYn || 'N'}
                                        onChange={(event) => {
                                            const updatedCheckItems = checkItems.map(
                                                (checkItem, i) =>
                                                    i === index
                                                        ? {
                                                            ...checkItem,
                                                            textYn: event.target.value
                                                        }
                                                        : checkItem
                                            );
                                            setCheckItems(updatedCheckItems);
                                        }}
                                    >
                                        <FormControlLabel value="Y" control={<Radio size='small'
                                            sx={{ color: '#1E88E5', '&.Mui-checked': { color: '#1E88E5' } }} />} label="텍스트 입력" />
                                        <FormControlLabel value="N" control={<Radio size='small'
                                            sx={{ color: '#1E88E5', '&.Mui-checked': { color: '#1E88E5' } }} />} label="상태값 선택" />
                                    </RadioGroup>
                                </Box>
                                <Box sx={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            borderColor: '#BABAB9',
                                            backgroundColor: '#F4F4F4',
                                            color: '#000',
                                            '&:hover': {
                                                borderColor: '#BABAB9',
                                                backgroundColor: '#E4E4E4',
                                            },
                                            fontWeight: 'bold'
                                        }}
                                        onClick={() => handleRemoveCheckItem(index)}
                                    >
                                        삭제
                                    </Button>
                                </Box>
                            </Box>
                            {index < checkItems.length - 1 && (
                                <Divider sx={{ borderStyle: 'dashed', borderColor: 'grey.400', mx: 5, }} />
                            )}
                        </React.Fragment>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                backgroundColor: '#F5F5F5',
                                border: '1px solid #D0D0D0',
                                color: '#737373',
                                padding: '6px 16px',
                                '&:hover': {
                                    backgroundColor: '#E5E5E5',
                                    border: '1px solid #D0D0D0',
                                },
                            }}
                            onClick={() => handleAddCheckItem()}
                        >
                            <Box component="span" sx={{ fontSize: '2rem', lineHeight: 1 }}>
                                +
                            </Box>
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 2, pb: 3, }}>
                    <Button
                        variant="contained"
                        sx={{
                            mr: 2,
                            width: 200,
                            fontSize: '1.0rem',
                            backgroundColor: '#B1BBCC',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#B1BBCC',
                                boxShadow: 'none',
                            }
                        }}
                        onClick={handleCancel}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            width: 200,
                            fontSize: '1.0rem',
                            backgroundColor: 'var(--main-blue-color)',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'var(--main-blue-color)',
                                boxShadow: 'none',
                            }
                        }}
                        onClick={handleSubmit(onSubmit)}
                    >
                        등록
                    </Button>
                </Box>
                <AlertForConfirm
                    open={showAdditionalItemAlert}
                    onClose={() => setShowAdditionalItemAlert(false)}
                    onConfirm={() => setShowAdditionalItemAlert(false)}
                    showCancel={false}
                    contentText="시설유형을 선택해주세요."
                />
                <AlertForConfirm
                    open={openFetchDialog}
                    onClose={() => setOpenFetchDialog(false)}
                    onConfirm={handleConfirmFetch}
                    contentText="작성한 점검항목이 삭제됩니다. 시설유형 점검항목을 불러오시겠습니까?"
                />
                <AlertForConfirm
                    open={openCancelDialog}
                    onClose={() => setOpenCancelDialog(false)}
                    onConfirm={handleConfirmCancel}
                    contentText="시설등록을 취소하시겠습니까?"
                />
                <AlertForConfirm
                    open={showNoCheckTypeAlert}
                    onClose={() => setShowNoCheckTypeAlert(false)}
                    onConfirm={() => setShowNoCheckTypeAlert(false)}
                    showCancel={false}
                    contentText="해당 시설유형에 등록된 점검유형이 없으므로 점검항목을 등록할 수 없습니다."
                />
            </Box>
        </Box>
    );
}

export default validationAuth(FacilityRegistration);