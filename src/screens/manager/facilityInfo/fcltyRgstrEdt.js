import React, { useState, useEffect, useRef } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Checkbox,
    TextField, Typography, Dialog, Divider, DialogActions, DialogContent,
    DialogTitle, RadioGroup, FormControlLabel, Radio, Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import * as common from '../../../commons/common';
import ImageUpload from '../../../images/image_upload.png';
import AlertForConfirm from '../../../components/alertForConfirm';

function FacilityRegistrationEdit() {
    const { facilityId } = useParams();
    const navigate = useNavigate();
    const [alertMsg, setAlertMsg] = useState('');

    const [selectedFacilityTypeId, setSelectedFacilityTypeId] = useState('');
    const changeCount = useRef(0); // 시설유형 변경 횟수(첫 변경시에는 초기화 하지않기위해)

    const [facilityTypes, setFacilityTypes] = useState([]); //시설유형 리스트
    const [checkCycles, setCheckCycles] = useState([]); //점검주기 리스트
    const [deptList, setDeptList] = useState([]); //전체 부서 리스트
    const [userOrgData, setUserOrgData] = useState({}); //로그인 사용자 부서정보

    const { control, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            facilityType: '',
            facilityNm: '',
            latitude: '',
            longitude: '',
            checkCycle: '',
        }
    });

    const [facilityDetails, setFacilityDetails] = useState({ //시설 기본정보
        facilityType: 0,
        facilityTypeNm: '',
        facilityNm: '',
        topDeptId: 0,
        topDeptNm: '',
        midDeptId: 0,
        midDeptNm: '',
        botDeptId: 0,
        botDeptNm: '',
        latitude: '',
        longitude: '',
        checkCycle: '',
        imageFile: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); //시설 이미지 미리보기
    const [selectedPath, setSelectedPath] = useState(''); //선택 부서 Tier Path 표출
    const [isQrCheck, setIsQrCheck] = useState(false); //qr 점검 여부

    //추가 관리항목
    const [facilityAddItems, setFacilityAddItems] = useState([
        {
            facilityTypeAddItemId: '',
            facilityAddItemId: '',
            addItemNm: '',
            addItemVal: '',
            addItemDtlNm: '',
            facilityTypeAddItemDtls: [],
        }
    ]);

    //점검항목
    const [checkTypeOptions, setCheckTypeOptions] = useState([]); //시설유형별 점검항목 리스트
    const [checkItems, setCheckItems] = useState([]); //점검유형,질문 리스트

    const [showAdditionalItemAlert, setShowAdditionalItemAlert] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [deletedCheckItems, setDeletedCheckItems] = useState([]);

    const [openDeptAssignModal, setOpenDeptAssignModal] = useState(false);
    const [showNoCheckTypeAlert, setShowNoCheckTypeAlert] = useState(false);

    const [openFetchDialog, setOpenFetchDialog] = useState(false);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openDeleteFacilityDialog, setOpenDeleteFacilityDialog] = useState(false);

    useEffect(() => {
        fetchFacilityDetails()
        fetchUserOrgData();
        fetchFacilityTypes();
        fetchCheckCycleList();
    }, [])

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
                setCheckCycles(response.data);
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
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if (response.data) {
                    const deptInfo = {
                        lastDeptLevel: response.data.lastDeptLevel,
                        topDeptId: response.data.dept[0].deptId,
                        topDeptNm: response.data.dept[0].deptNm,
                        midDeptId: response.data.dept[1].deptId,
                        midDeptNm: response.data.dept[1].deptNm,
                        botDeptId: response.data.dept[2].deptId,
                        botDeptNm: response.data.dept[2].deptNm,
                    }
                    setUserOrgData(deptInfo);
                }
            } catch (error) {
                common.handleApiError(error);
            }
            //all dept 가져오기
            try {
                const response = await axios.get(`${common.getApiUrl()}/dept/all`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                setDeptList(response.data);
            } catch (error) {
                console.error('조직 데이터를 가져오는데 실패했습니다:', error);
                alert('조직 데이터를 가져올 수 없습니다.');
            }
        }
    };

    //시설 정보 가져오기
    const fetchFacilityDetails = async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/${facilityId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.status === 200) {
                const data = response.data;

                setFacilityDetails(prevDetails => ({
                    ...prevDetails,
                    facilityNm: data.facilityNm || '',
                    topDeptId: data.topDeptId || 0,
                    topDeptNm: data.topDeptNm || '',
                    midDeptId: data.midDeptId || 0,
                    midDeptNm: data.midDeptNm || '',
                    botDeptId: data.botDeptId || 0,
                    botDeptNm: data.botDeptNm || '',
                    qrYn : data.qrYn || 'N',
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    checkCycle: data.checkCycle === null ? 'None' : data.checkCycle,
                    facilityTypeNm: data.facilityTypeNm || '',
                    facilityType: data.facilityType || 0,
                    imageFile: data.imageFile || '',
                }));
                setSelectedFacilityTypeId(response.data.facilityType);
                setIsQrCheck(data.qrYn === 'Y' ? true : false)
                setFacilityAddItems(response.data.facilityAddItems);
                setCheckItems(data.checkItems.map(item => ({
                    checkTypeId: String(item.checkTypeId),
                    checkItemId: item.checkItemId,
                    checkItemNm: item.checkItemNm,
                    checkTypeNm: item.checkTypeNm,
                    textYn: item.textYn
                })));
                fetchCheckTypes(response.data.facilityType);
                if (data.imageFile) setImagePreviewUrl(`${common.getImageBaseUrl()}${data.imageFile}`);

                const pathParts = [data.topDeptNm, data.midDeptNm, data.botDeptNm].filter(Boolean);
                setSelectedPath(pathParts.join(" - "));

                // 폼 필드 값 설정
                setValue('facilityType', data.facilityType);
                setValue('facilityNm', data.facilityNm);
                setValue('longitude', data.longitude);
                setValue('latitude', data.latitude);
                setValue('checkCycle', data.checkCycle);
            }
        } catch (error) {
            console.error("Error fetching facility details:", error);
        }
    };

    const handleFacilityTypeChange = (event) => {
        setSelectedFacilityTypeId(event.target.value)
    }

    // 시설유형 변경 감지 작업
    useEffect(() => {
        // 첫 시설유형 저장 시에는 무시
        if (changeCount.current === 0 || changeCount.current === 1) {
            changeCount.current += 1;
            return;
        }
    
        const handleFacilityTypeChangeDetect = async () => {
            const selectedFacilityTypeNm = facilityTypes.find(type => type.facilityTypeId === selectedFacilityTypeId)?.facilityTypeNm;
    
            if (selectedFacilityTypeId) {
                setFacilityDetails(prev => ({
                    ...prev,
                    facilityTypeNm: selectedFacilityTypeNm,
                    facilityType: selectedFacilityTypeId
                }));
                fetchFacilityAddItems(selectedFacilityTypeId);
                fetchCheckTypes(selectedFacilityTypeId);
                setCheckItems([]);
            } else {
                setFacilityDetails(prev => ({
                    ...prev,
                    facilityTypeNm: '',
                    facilityType: ''
                }));
                setFacilityAddItems([]);
                setCheckTypeOptions([]);
                setCheckItems([]);
            }
        };
        changeCount.current += 1;
        handleFacilityTypeChangeDetect();
    }, [selectedFacilityTypeId]);

    //시설명 변경
    const handleChangeFactilityNm = (event) => {
        const { name, value } = event.target;
        setFacilityDetails(prev => ({ ...prev, [name]: value }));
    };

    //시설 사진 변경
    const handleFileChange = (event) => {
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

    //관리처 선택 모달 open
    const handleOpenDeptAssignModal = () => setOpenDeptAssignModal(true);

    //관리처 선택 모달 close
    const handleCloseDeptModal = () => {
        setOpenDeptAssignModal(false);
        setAlertMsg('')
    };

    //관리처 모달에서 Tier 변경 작업
    const handleFacilityDeptChange = (event, deptLevel) => {
        const selectedDeptId = event.target.value;
        const selectedDeptNm = deptList.find(item => item.deptId === selectedDeptId)?.deptNm
        if (deptLevel == 2) {
            setFacilityDetails(prev => ({ ...prev, ['midDeptId']: selectedDeptId }));
            setFacilityDetails(prev => ({ ...prev, ['midDeptNm']: selectedDeptNm }));
        }
        else if (deptLevel == 3) {
            setFacilityDetails(prev => ({ ...prev, ['botDeptId']: selectedDeptId }));
            setFacilityDetails(prev => ({ ...prev, ['botDeptNm']: selectedDeptNm }));
        }
    }

    //관리처 선택 모달 저장 클릭
    const handleCloseModal = () => {
        if (!facilityDetails.midDeptId || !facilityDetails.botDeptId) {
            setAlertMsg('관리처 조직을 선택해주세요.')
            return;
        } else {
            const pathParts = [facilityDetails.topDeptNm, facilityDetails.midDeptNm, facilityDetails.botDeptNm].filter(Boolean);
            const path = pathParts.join(" - ");
            setSelectedPath(path);
            setOpenDeptAssignModal(false);
        }
    };

    //점검주기 변경
    const handleCheckCycleChange = (event) => {
        const selectedCheckCycleCode = event.target.value;
        const changeCheckCycle = checkCycles.find(cycle => cycle.code === selectedCheckCycleCode);
        if (changeCheckCycle) {
            setFacilityDetails(prev => ({
                ...prev,
                checkCycle: changeCheckCycle.code
            }))
        }
    }

    //위도 입력
    const handleLatitudeChange = (event) => {
        const value = event.target.value;
        const maskedValue = value
            .replace(/[^0-9.-]/g, '') // 숫자, 점, 하이픈 이외의 문자는 제거
            .replace(/(?!^-)-/g, '') // 하이픈은 처음 위치에만 허용
            .replace(/(\..*?)\..*/g, '$1') // 여러 개의 점이 입력되는 것을 방지
            .replace(/^(-?\d{2})(\d)/, '$1.$2'); // 두 번째 숫자 뒤에 점을 추가
        setFacilityDetails((prev) => ({ ...prev, latitude: maskedValue }));
    };

    //경도 입력
    const handleLongitudeChange = (event) => {
        const value = event.target.value;
        const maskedValue = value
            .replace(/[^0-9.-]/g, '') // 숫자, 점, 하이픈 이외의 문자는 제거
            .replace(/(?!^-)-/g, '') // 하이픈은 처음 위치에만 허용
            .replace(/(\..*?)\..*/g, '$1') // 여러 개의 점이 입력되는 것을 방지
            .replace(/^(-?\d{3})(\d)/, '$1.$2'); // 세 번째 숫자 뒤에 점을 추가
        setFacilityDetails((prev) => ({ ...prev, longitude: maskedValue }));
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

    // 추가 관리항목 onChange
    const handleAdditionalItemChange = (event, facilityTypeAddItemId) => {
        const { value } = event.target;

        const updatedArray = facilityAddItems.map(item => {
            if (item.facilityTypeAddItemId === facilityTypeAddItemId) {
                if (item.facilityTypeAddItemDtls && item.facilityTypeAddItemDtls.length > 0) {
                    return {
                        ...item,
                        addItemVal: value, //select랑 textField 모두 addItemVal에 저장함(?)
                    };
                }
            } else {
                return item;
            }
        });
        setFacilityAddItems(updatedArray);
    };

    //시설유형별 점검유형 리스트
    const fetchCheckTypes = async (facilityTypeId) => {
        try {
            const response = await axios.get(
                `${common.getApiUrl()}/facility-type/check-type`, {
                params: { facilityTypeId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.data.length > 0) {
                setCheckTypeOptions(response.data.map(item => ({
                    checkTypeId: String(item.checkTypeId),
                    checkTypeNm: item.checkTypeNm
                })))
            };
        } catch (error) {
            console.error('Failed to fetch check types:', error);
            return [];
        }
    };

    const handleCancel = () => {
        setOpenCancelDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteIndex(null);
        setDeleteType(null);
    };

    const handleConfirmDelete = () => {
        if (deleteType === 'checkItem') {
            handleRemoveGridItem(deleteIndex);
        }
        handleCloseDeleteDialog();
    };

    const handleConfirmCancel = () => {
        setOpenCancelDialog(false);
        navigate('/manager/facility-info', { replace: true });
    };

    const handleDeleteCheckItem = (index) => {
        const itemToDelete = checkItems[index];
        if (itemToDelete.checkItemId) {
            setDeletedCheckItems([...deletedCheckItems, itemToDelete.checkItemId]);
        }
        const newCheckItems = checkItems.filter((_, i) => i !== index);
        setCheckItems(newCheckItems);
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

        if (!checkTypeOptions.length > 0) {
            setShowNoCheckTypeAlert(true)
            return;
        }

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
                const relatedItems = checkItems.filter(item => String(item.checkTypeId) === type.checkTypeId);

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
        if (!checkTypeOptions.length > 0) {
            setShowNoCheckTypeAlert(true)
            return;
        }
        setCheckItems([
            ...checkItems,
            { checkTypeNm: '', checkItemNm: '', checkTypeId: 0, textYn: 'N' }
        ]);
    };

    const handleRemoveAdditionalItem = (index) => {
        setFacilityAddItems(
            prevItems => prevItems.filter((_, i) => i !== index));
    };

    const handleAddAdditionalItem = () => {
        setFacilityAddItems(prevItems => [...prevItems,
        { addItemNm: '', addItemDtlNm: '', facilityTypeAddItemDtls: [] }]);
    };


    const handleRemoveGridItem = (index) => {
        handleDeleteCheckItem(index);
    };

    const handleConfirmFetch = async () => {
        setOpenFetchDialog(false);
        await fetchCheckItemSet();
    };

    const handleCheckTypeChange = (event, index) => {
        const { value } = event.target;
        const selectedCheckType = checkTypeOptions.find(option => option.checkTypeId === value);

        setCheckItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        checkTypeNm: selectedCheckType.checkTypeNm,
                        checkTypeId: value
                    }
                    : item
            )
        );
    };

    const handleTextYnChange = (event, index) => {
        const { value } = event.target;
        setCheckItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        textYn: value
                    }
                    : item
            )
        );
    };

    const onSubmit = async (data) => {
        const updateFacilityRequest = {
            facilityId: parseInt(facilityId),
            facilityNm: facilityDetails.facilityNm || "",
            topDeptId: facilityDetails.topDeptId ? parseInt(facilityDetails.topDeptId) : 0,
            topDeptNm: facilityDetails.topDeptNm || "",
            midDeptId: facilityDetails.midDeptId ? parseInt(facilityDetails.midDeptId) : 0,
            midDeptNm: facilityDetails.midDeptNm || "",
            botDeptId: facilityDetails.botDeptId ? parseInt(facilityDetails.botDeptId) : 0,
            botDeptNm: facilityDetails.botDeptNm || '',
            latitude: facilityDetails.latitude || "",
            longitude: facilityDetails.longitude || "",
            qrYn : isQrCheck ? 'Y' : 'N',
            checkCycle: facilityDetails.checkCycle === 'None' ? '' : facilityDetails.checkCycle,
            facilityType: parseInt(facilityDetails.facilityType) || 0,
            facilityAddItems: facilityAddItems.map(item => ({
                facilityAddItemId: item.facilityAddItemId || 0,
                facilityTypeAddItemId: item.facilityTypeAddItemId,
                addItemVal: item.addItemVal || ""
            })),
            checkItems: checkItems.filter(item => item.checkItemNm && item.checkTypeNm).map(item => ({
                checkItemId: item.checkItemId || 0,
                checkItemNm: item.checkItemNm,
                checkTypeId: parseInt(item.checkTypeId), //select option은 string만 취급
                textYn: item.textYn || 'N'
            })),
            checkItemDeleteList: deletedCheckItems
        };

        const formData = new FormData();
        formData.append('updateFacilityRequest', new Blob([JSON.stringify(updateFacilityRequest)], { type: 'application/json' }));

        if (imageFile) {
            formData.append('uploadFile', imageFile);
        } else {
            formData.append('uploadFile', "");
        }

        try {
            const response = await axios.put(
                `${common.getApiUrl()}/facility/${facilityId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                }
            );
            navigate('/manager/facility-info', { replace: true });
        } catch (error) {
            if (error.response) {
                console.error("Update failed", error.response.data);
            } else {
                console.error("Update failed", error.message);
            }
        }
    };

    const handleDeleteFacilityClick = () => {
        setOpenDeleteFacilityDialog(true);
    };

    const handleConfirmDeleteFacility = async () => {
        try {
            await axios.delete(`${common.getApiUrl()}/facility/${facilityId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            navigate('/manager/facility-info', { replace: true });
        } catch (error) {
            console.error("Facility deletion failed", error);
        }
        setOpenDeleteFacilityDialog(false);
    };

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
                            {/* 이미지 미리보기 */}
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
                                onClick={() => document.getElementById('raised-button-file').click()}
                            >
                                {imagePreviewUrl ? (
                                    <img src={imagePreviewUrl} alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
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
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={handleFileChange}
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
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        sx={{ width: 'calc(100% - 120px)' }}
                                        name="facilityNm"
                                        value={facilityDetails.facilityNm || ''}
                                        onChange={handleChangeFactilityNm}
                                    />
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
                                                        maxHeight: '500px',
                                                        overflow: 'auto'
                                                    }
                                                }}
                                            >
                                                <DialogTitle>관리처 선택</DialogTitle>
                                                <DialogContent>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel id="tier1">관리본부</InputLabel>
                                                        <Select
                                                            labelId='tier1'
                                                            value={facilityDetails.topDeptId}
                                                            disabled
                                                            label="관리본부"
                                                        >
                                                            <MenuItem value={facilityDetails.topDeptId}>{facilityDetails.topDeptNm}</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel id="tier2">관리부서</InputLabel>
                                                        <Select
                                                            labelId='tier2'
                                                            value={facilityDetails.midDeptId}
                                                            label="관리부서"
                                                            onChange={(event) => handleFacilityDeptChange(event, 2)}
                                                            disabled={userOrgData.lastDeptLevel === 0 || userOrgData.lastDeptLevel === 2 || userOrgData.lastDeptLevel === 3}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 2).length > 0 ? (
                                                                deptList.filter(dept => dept.deptLevel === 2).map((item) => (
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
                                                            value={facilityDetails.botDeptId}
                                                            onChange={(event) => handleFacilityDeptChange(event, 3)}
                                                            label="팀"
                                                            disabled={userOrgData.lastDeptLevel === 0 || userOrgData.lastDeptLevel === 3}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === facilityDetails.midDeptId).length > 0 ? (
                                                                deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === facilityDetails.midDeptId).map((item) => (
                                                                    <MenuItem key={item.deptId} value={item.deptId}>
                                                                        {item.deptNm}
                                                                    </MenuItem>
                                                                ))
                                                            ) : (
                                                                <MenuItem disabled>조직이 없습니다.</MenuItem>
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
                                                        onClick={handleCloseModal}
                                                        color="primary"
                                                        variant="contained"
                                                        sx={{ width: '100%' }}
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
                                                    <Controller
                                                        name="checkCycle"
                                                        control={control}
                                                        defaultValue=""
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                value={facilityDetails.checkCycle}
                                                                onChange={handleCheckCycleChange}
                                                                notched={false}  // 추가: 테두리가 끊기지 않도록 설정
                                                            >
                                                                {checkCycles.map((cycle) => (
                                                                    <MenuItem key={cycle.code} value={cycle.code}>
                                                                        {cycle.title}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    />
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
                                                        value={facilityDetails.latitude}
                                                        onChange={handleLatitudeChange}
                                                    />
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        name="longitude"
                                                        placeholder="경도"
                                                        autoComplete="off"
                                                        value={facilityDetails.longitude}
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
                {/* 추가 항목 섹션 */}
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 1.5, }}>추가항목</Typography>
                <Box sx={{ border: '2px solid #9B9B9B', borderRadius: 2, p: 2, mb: 3 }}>
                    {facilityAddItems.length > 0 ? (
                        facilityAddItems.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ width: 150, fontWeight: 'bold' }}>{item.addItemNm}</Typography>
                                {item.facilityTypeAddItemDtls.length > 0 ? (
                                    <Select
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        value={item.addItemVal || ''}
                                        onChange={(e) => handleAdditionalItemChange(e, item.facilityTypeAddItemId)}
                                    >
                                        {item.facilityTypeAddItemDtls.map(option => (
                                            <MenuItem key={option.facilityTypeAddItemDtlId} value={option.facilityTypeAddItemDtlId}>
                                                {option.addItemDtlNm}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        autoComplete="off"
                                        value={item.addItemVal || ''}
                                        onChange={(e) => handleAdditionalItemChange(e, item.facilityTypeAddItemId)}
                                    />
                                )}
                            </Box>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', color: '#9B9B9B' }}>추가항목이 없습니다</Typography>
                    )}

                </Box>
                {/* 점검 항목 섹션 */}
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
                    {checkItems.length > 0 &&
                        checkItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 3 }}>
                                    <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ mr: 1, flexShrink: 0, fontWeight: 'bold', }}>점검유형</Typography>
                                        <FormControl size="small" sx={{ width: '100%' }}>
                                            <Select displayEmpty
                                                value={item.checkTypeId || ''}
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
                                    <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', ml: 2 }}>
                                        <Typography sx={{ mr: 1, width: '100px', flexShrink: 0, fontWeight: 'bold', pl: 3 }}>점검질문</Typography>
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
                                            onClick={() => handleDeleteCheckItem(index)}
                                        >
                                            삭제
                                        </Button>
                                    </Box>
                                </Box>
                                {index < checkItems.length - 1 && (
                                    <Divider sx={{ borderStyle: 'dashed', borderColor: 'grey.400', mx: 5, }} />
                                )}
                            </React.Fragment>
                        ))
                    }
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
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 6
                }}>
                    <Button
                        variant="outlined"
                        color="error"
                        sx={{ width: 150, fontSize: '1.0rem', boxShadow: 'none', position: 'absolute', top: 0, left: 0 }}
                        onClick={handleDeleteFacilityClick}
                    >
                        시설 삭제
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            수정
                        </Button>
                    </Box>
                </Box>
                <AlertForConfirm
                    open={showAdditionalItemAlert}
                    onClose={() => setShowAdditionalItemAlert(false)}
                    onConfirm={() => setShowAdditionalItemAlert(false)}
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
                    contentText="수정을 취소하시겠습니까?"
                />
                <AlertForConfirm
                    severity='warning'
                    open={openDeleteFacilityDialog}
                    onClose={() => setOpenDeleteFacilityDialog(false)}
                    onConfirm={handleConfirmDeleteFacility}
                    contentText="시설을 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다."
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

export default validationAuth(FacilityRegistrationEdit);
