import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, Pagination,
    TablePagination, TableRow, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Select, MenuItem, FormControl, InputLabel, Radio, RadioGroup, FormControlLabel, IconButton, Alert
} from '@mui/material';
import { Modal } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import * as common from '../../../commons/common';
import AlertForConfirm from '../../../components/alertForConfirm';

const FacilityManagement = () => {
    const [facilityTypes, setFacilityTypes] = useState([]);

    //시설유형
    const [isFacilityClassificationOpen, setIsFacilityClassificationOpen] = useState(false);
    const [removeFacilityTypeId, setRemoveFacilityTypeId] = useState('');
    const [isOpenAlertForFacilityTypeRmv, setIsOpenAlertForFacilityTypeRmv] = useState(false);

    // 점검항목 관리
    const [isCheckTypesAndItemsOpen, setIsCheckTypesAndItemsOpen] = useState(false);
    const [selectedFacilityTypeIdForCheckTypesAndItems, setSelectedFacilityTypeIdForCheckTypesAndItems] = useState(''); //점검항목 관리 시설유형 선택
    const [checkTypes, setCheckTypes] = useState([]); // 점검유형 리스트
    const [checkTypesAndItems, setCheckTypesAndItems] = useState([]); // 점검항목,질문 통합 관리
    //점검항목 테이블 페이징
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState('');

    const [selectEditCheckTypeNm, setSelectEditCheckTypeNm] = useState(''); // 수정 점검유형명
    const [isAddNewCheckType, setIsAddNewCheckType] = useState(false); //신규 추가 구분값
    const [removeCheckTypeId, setRemoveCheckTypeId] = useState('');
    const [isOpenEditCheckItemModal, setIsOpenEditCheckItemModal] = useState(false); //수정 모달 오픈
    const [editCheckTypeId, setEditCheckTypeId] = useState(''); //수정 checkTypeId    
    const [editArrayCheckTypeAndItems, setEditArrayCheckTypeAndItems] = useState([]); // 추가/수정 모달 데이터 
    const [chkTypeModalAlert, setChkTypeModalAlert] = useState('');

    const [isOpenAlertForChkTypeRmv, setIsOpenAlertForChkTypeRmv] = useState(false); //점검항목 삭제 alert
    const [alert1, setAlert] = useState('');

    //점검상태
    const [isFacilityCheckStateOpen, setIsFacilityCheckStateOpen] = useState(false);
    const [selectedFacilityTypeForCheckState, setSelectedFacilityTypeForCheckState] = useState(''); //시설유형 선택
    const [facilityCheckStateItems, setFacilityCheckStateItems] = useState([]);
    const [newCheckStateName, setNewCheckState] = useState(''); //추가 점검상태 이름
    const [removeFacilityCheckStateId, setRemoveFacilityCheckStateId] = useState('');
    const [isOpenAlertForFacilityCheckStateRmv, setIsOpenAlertForFacilityCheckStateRmv] = useState(false);
    const [alert3, setAlert3] = useState('');

    //추가 관리항목    
    const [isFacilityItemOpen, setIsFacilityItemOpen] = useState(false);
    const [selectedFacilityTypeForAddItems, setSelectedFacilityTypeForAddItems] = useState(''); //시설유형 선택
    const [facilityAddItems, setFacilityAddItems] = useState([]);
    const [newItemName, setNewItemName] = useState(''); //추가 관리항목 이름
    const [removeAddItemId, setRemoveAddItemId] = useState('');
    const [isOpenAlertForAddItemRmv, setIsOpenAlertForAddItemRmv] = useState(false); //추가항목 삭제 alert
    const [alert2, setAlert2] = useState('');

    //민원항목
    const [isFacilityComplaointOpen, setIsFacilityComplaointOpen] = useState(false);
    const [selectedFacilityTypeForComplaint, setSelectedFacilityTypeForComplaint] = useState(''); //시설유형 선택
    const [facilityComplaintItems, setFacilityComplaintItems] = useState([]);
    const [newComplaintName, setNewComplaint] = useState(''); //추가 점검상태 이름
    const [removeFacilityComplaintId, setRemoveFacilityComplaintId] = useState('');
    const [isOpenAlertForFacilityComplaintRmv, setIsOpenAlertForFacilityComplaintRmv] = useState(false);
    const [alert4, setAlert4] = useState('');

    const [editItem, setEditItem] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogType, setEditDialogType] = useState('');

    useEffect(() => {
        fetchFacilityTypes();
    }, []);

    //시설유형 리스트(get)
    const fetchFacilityTypes = async () => {
        const url = `${common.getApiUrl()}/admin/facility-type`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const facilityNames = response.data.map(facility => ({
                    id: facility.facilityTypeId,
                    name: facility.facilityTypeNm
                }));
                setFacilityTypes(facilityNames);
            }
        } catch (error) {
            console.error("Failed to fetch facility types:", error);
        }
    };

    //시설유형 토글
    const toggleFacilityClassification = () => {
        setIsFacilityClassificationOpen(!isFacilityClassificationOpen);
        if (!isFacilityClassificationOpen) {
            fetchFacilityTypes();
        }
    };

    //시설유형 추가 클릭
    const handleAddFacilityType = () => {
        setEditItem({ name: '' });
        setEditDialogType('addFacilityType');
        setEditDialogOpen(true);
    };

    //시설유형 수정 클릭
    const handleEditFacilityTypeNm = (item) => {
        setEditItem({
            id: item.id,
            name: item.name
        });
        setEditDialogType('editFacilityType');
        setEditDialogOpen(true);
    };

    //시설유형 삭제 클릭
    const clickRemoveFacilityType = (facilityTypeId) => {
        setIsOpenAlertForFacilityTypeRmv(true);
        setRemoveFacilityTypeId(facilityTypeId)
    };

    //시설유형 삭제
    const handleRemoveFacilityType = async () => {
        const url = `${common.getApiUrl()}/admin/facility-type/${removeFacilityTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchFacilityTypes()
            handleAlertClose();
        } catch (error) {
            console.error("Failed to delete facility type:", error);
            alert(`Error: ${error.response.data.message}`);
        }

    };

    //점검항목 관리 토글
    const toggleCheckTypeAndItems = async () => {
        if (!isCheckTypesAndItemsOpen) await fetchFacilityTypes();
        setSelectedFacilityTypeIdForCheckTypesAndItems('');
        setCheckTypes([])
        setCheckTypesAndItems([])
        setIsCheckTypesAndItemsOpen(!isCheckTypesAndItemsOpen);
        setAlert('')
    };

    //점검항목 관리 - 시설유형 선택
    const handleFacilityTypeChangeForCheckTypesAndItems = async (event) => {
        const selectedFacilityTypeId = event.target.value;
        setSelectedFacilityTypeIdForCheckTypesAndItems(selectedFacilityTypeId)
        setAlert('')
    };

    //점검항목 관리 - 시설유형 변경 감지, 데이터 fetch
    useEffect(() => {
        if (selectedFacilityTypeIdForCheckTypesAndItems) {
            fetchCheckTypesAndItems(selectedFacilityTypeIdForCheckTypesAndItems);
        }
    }, [selectedFacilityTypeIdForCheckTypesAndItems]);

    // 점검유형,점검질문을 가져오기(세트로 저장)
    const fetchCheckTypesAndItems = async (facilityTypeId) => {
        const checkTypeUrl = `${common.getApiUrl()}/admin/check-type?facilityTypeId=${facilityTypeId}`;
        const checkItemUrl = `${common.getApiUrl()}/admin/check-item?facilityTypeId=${facilityTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            const checkTypeResponse = await axios.get(checkTypeUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const checkItemResponse = await axios.get(checkItemUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const checkTypes = checkTypeResponse.data || [];
            const checkItems = checkItemResponse.data || [];
            setCheckTypes(checkTypes);

            const items = checkTypes.flatMap(type => {
                const relatedItems = checkItems.filter(item => item.checkTypeId === type.checkTypeId);

                if (relatedItems.length > 0) {
                    return relatedItems.map(item => ({
                        facilityTypeId: facilityTypeId,
                        facilityType: facilityTypes.find(facility => facility.id === facilityTypeId)?.name,
                        checkTypeId: type.checkTypeId,
                        checkTypeNm: type.checkTypeNm,
                        facilityTypeCheckItemId: item.facilityTypeCheckItemId,
                        checkItemNm: item.checkItemNm,
                        textInput: item.textYn
                    }));
                } else {
                    // checkItem이 없는 점검유형이면 빈 item으로 객체 생성
                    return {
                        facilityTypeId: facilityTypeId,
                        facilityType: facilityTypes.find(facility => facility.id === facilityTypeId)?.name,
                        checkTypeId: type.checkTypeId,
                        checkTypeNm: type.checkTypeNm,
                        facilityTypeCheckItemId: "",
                        checkItemNm: "",
                        textInput: ""
                    };
                }
            });

            setCheckTypesAndItems(items);
        } catch (error) {
            console.error("Failed to fetch CheckTypesAndItems:", error);
        }
    };

    useEffect(() => {
        setTotalElements(checkTypesAndItems.length)
    }, [checkTypesAndItems])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    // 페이지에 맞는 데이터 슬라이스
    const paginatedFacilityCheckTypesAndItems = checkTypesAndItems.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    //점검항목 신규 추가
    const handleAddCheckType = () => {
        if (!selectedFacilityTypeIdForCheckTypesAndItems) {
            setAlert('시설유형을 선택해주세요')
            return;
        }
        setIsAddNewCheckType(true) // 신규 추가임을 설정하기. 저장 시 항목명 먼저 처리를 위해
        setIsOpenEditCheckItemModal(true);
    };

    //점검항목 질문관리 클릭
    const handleOpenModalEditCheckTypeAndItem = async (checkTypeId) => {
        setIsAddNewCheckType(false);
        setEditCheckTypeId(checkTypeId);

        const checkItemsForType = checkTypesAndItems.filter(item => item.checkTypeId === checkTypeId);
        const hasCheckItems = checkItemsForType.some(item => item.checkItemNm);

        if (hasCheckItems) {
            const newArray = checkItemsForType.map(item => ({
                ...item,
                state: ''  // save 시, 추가/수정/삭제 구분값
            }));
            setSelectEditCheckTypeNm(newArray[0].checkTypeNm);
            setEditArrayCheckTypeAndItems(newArray);
        } else {
            // 체크 항목이 없으면 빈 배열로 설정
            setEditArrayCheckTypeAndItems([]);
            setSelectEditCheckTypeNm(checkItemsForType[0]?.checkTypeNm || '');
        }

        setIsOpenEditCheckItemModal(true);
    };

    //점검항목 질문관리 모달 field change
    const handleEditCheckTypeAndItemChange = (facilityTypeCheckItemId, field, value) => {
        const isNewItem = !facilityTypeCheckItemId && field !== 'checkTypeNm';

        const updatedArray = editArrayCheckTypeAndItems.map((item) => {
            if (isNewItem && item.state === 'post') {
                return { ...item, [field]: value, facilityTypeId: selectedFacilityTypeIdForCheckTypesAndItems };
            }

            if (item.facilityTypeCheckItemId === facilityTypeCheckItemId) {
                if (item.state === 'post') { // 신규 추가(post)면 state 업데이트 안함
                    return { ...item, [field]: value, facilityTypeId: selectedFacilityTypeIdForCheckTypesAndItems };
                }
                return { ...item, [field]: value, state: 'put', facilityTypeId: selectedFacilityTypeIdForCheckTypesAndItems };
            }

            return item;
        });

        // 체크 항목이 아닌 경우 (checkTypeNm)
        if (field === 'checkTypeNm') {
            setSelectEditCheckTypeNm(value);
        } else {
            setEditArrayCheckTypeAndItems(updatedArray);
        }
    };

    const generateTemporaryCheckItemId = () => {
        let newItemId;
        do {
            newItemId = Math.floor(Math.random() * 1000000);
        } while (editArrayCheckTypeAndItems.some(item => item.facilityTypeCheckItemId === newItemId));
        return newItemId;
    };

    const handleAddCheckItem = () => {
        setChkTypeModalAlert('')

        const temporaryCheckItemId = generateTemporaryCheckItemId();
        if (isAddNewCheckType) {
            setEditArrayCheckTypeAndItems([...editArrayCheckTypeAndItems, { checkTypeId: '', checkItemNm: '', facilityTypeCheckItemId: temporaryCheckItemId, textInput: 'N', state: 'post' }]);
        } else {
            setEditArrayCheckTypeAndItems([...editArrayCheckTypeAndItems, { checkTypeId: editCheckTypeId, checkItemNm: '', facilityTypeCheckItemId: temporaryCheckItemId, textInput: 'N', state: 'post' }]);
        }
    };

    //점검항목 모달에서 질문 삭제
    const handleRemoveCheckItem = (facilityTypeCheckItemId) => {
        const filteredArray = editArrayCheckTypeAndItems.filter(item => item.state !== 'delete');

        if (filteredArray.find(item => item.facilityTypeCheckItemId === facilityTypeCheckItemId && item.state === 'post')) {
            // 신규 추가였던 건 바로 필터링
            const updatedArray = filteredArray.filter(item => item.facilityTypeCheckItemId !== facilityTypeCheckItemId);
            setEditArrayCheckTypeAndItems(updatedArray);
        } else {
            const updatedArray = editArrayCheckTypeAndItems.map(item => {
                if (item.facilityTypeCheckItemId === facilityTypeCheckItemId) {
                    return { ...item, state: 'delete' };
                }
                return item;
            });
            setEditArrayCheckTypeAndItems(updatedArray);
        }
    }

    //점검항목 모달 저장 클릭
    const handleSaveEditCheckTypeAndItem = () => {
        if (selectEditCheckTypeNm === '') {
            setChkTypeModalAlert('점검항목명을 입력해주세요.')
        } else {
            handleCheckItemEditRequest(selectEditCheckTypeNm, editArrayCheckTypeAndItems);
        }
    }

    //점검항목 모달 저장 (추가/수정/삭제 통합 처리)
    const handleCheckItemEditRequest = async (selectEditCheckTypeNm, editArray) => {
        const token = localStorage.getItem('access_token');

        const isEmptyItems = editArray.filter(item => item.checkItemNm.trim() === '');
        if (isEmptyItems.length > 0) {
            setChkTypeModalAlert('점검질문을 모두 입력해 주세요.')
            return;
        }

        try {
            if (isAddNewCheckType) {
                const previousCheckTypes = [...checkTypes];

                const url = `${common.getApiUrl()}/admin/check-type`;
                const requestData = {
                    facilityTypeId: selectedFacilityTypeIdForCheckTypesAndItems,
                    checkTypeNm: selectEditCheckTypeNm
                };

                const response = await axios.post(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    const getUrl = `${common.getApiUrl()}/admin/check-type?facilityTypeId=${selectedFacilityTypeIdForCheckTypesAndItems}`;
                    const getResponse = await axios.get(getUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (getResponse.data) {

                        const newCheckType = getResponse.data.find(item =>
                            !previousCheckTypes.some(prevItem => prevItem.checkTypeId === item.checkTypeId)
                        );

                        if (!newCheckType) {
                            console.error('방금 추가된 checkType을 찾을 수 없습니다.');
                            throw new Error('방금 추가된 checkType을 찾을 수 없습니다.');
                        }

                        const newCheckTypeId = newCheckType.checkTypeId;
                        if (newCheckTypeId) {
                            for (const item of editArray) {
                                if (item.state === 'post') {
                                    await axios.post(`${common.getApiUrl()}/admin/check-item`, {
                                        checkTypeId: newCheckTypeId,
                                        checkItemNm: item.checkItemNm,
                                        textYn: item.textInput,
                                    }, {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            } else {
                if (selectEditCheckTypeNm) {
                    const url = `${common.getApiUrl()}/admin/check-type/${editCheckTypeId}`;
                    const requestData = {
                        facilityTypeId: selectedFacilityTypeIdForCheckTypesAndItems,
                        checkTypeNm: selectEditCheckTypeNm
                    };

                    const response = await axios.put(url, requestData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }

                const requests = editArray.map(item => {
                    let url = `${common.getApiUrl()}/admin/check-item`;
                    let method = '';
                    let requestData = {
                        checkTypeId: editCheckTypeId,
                        checkItemNm: item.checkItemNm,
                        textYn: item.textInput,
                    };

                    switch (item.state) {
                        case 'post':
                            method = 'POST';
                            break;
                        case 'put':
                            method = 'PUT';
                            url += `/${item.facilityTypeCheckItemId}`;
                            break;
                        case 'delete':
                            method = 'DELETE';
                            url += `/${item.facilityTypeCheckItemId}`;
                            break;
                        default:
                            return null; // 유효하지 않은 state는 처리하지 않음
                    }

                    return axios({
                        method,
                        url,
                        data: method !== 'DELETE' ? requestData : undefined,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }).then(response => {
                        if (response && response.data) {
                        }
                    }).catch(error => {
                        console.error(`${item.state} 실패:`, error);
                    });
                }).filter(Boolean);

                await Promise.all(requests);
            }

            handleCloseModalEditCheckTypeAndItem();
            setSelectedFacilityTypeIdForCheckTypesAndItems(selectedFacilityTypeIdForCheckTypesAndItems);
            await fetchCheckTypesAndItems(selectedFacilityTypeIdForCheckTypesAndItems);

        } catch (error) {
            console.error("요청 처리 실패:", error);
            alert(`오류 발생: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    };

    //점검항목 질문관리 모달 닫기
    const handleCloseModalEditCheckTypeAndItem = () => {
        setSelectEditCheckTypeNm('');
        setEditCheckTypeId('');
        setEditArrayCheckTypeAndItems([]);
        setChkTypeModalAlert('');
        setIsOpenEditCheckItemModal(false);
    };

    //점검항목 삭제 클릭
    const clickRemoveCheckType = (checkTypeId) => {
        setIsOpenAlertForChkTypeRmv(true);
        setRemoveCheckTypeId(checkTypeId)
    };

    //점검항목 삭제
    const handleRemoveCheckType = async () => {
        setIsOpenAlertForChkTypeRmv(false);
        const url = `${common.getApiUrl()}/admin/check-type/${removeCheckTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            await fetchCheckTypesAndItems(selectedFacilityTypeIdForCheckTypesAndItems); // 삭제 후 데이터 갱신
        } catch (error) {
            console.error("점검항목 삭제 실패:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }
    }

    //점검상태 토글
    const toggleFacilityCheckState = async () => {
        if (!isFacilityCheckStateOpen) await fetchFacilityTypes();
        setSelectedFacilityTypeForCheckState('')
        setFacilityCheckStateItems([])
        setIsFacilityCheckStateOpen(!isFacilityCheckStateOpen);
    };

    //점검상태 관리 - 시설유형 선택
    const handleFacilityTypeForCheckState = (event) => {
        const selectedType = facilityTypes.find(type => type.id === event.target.value);
        setSelectedFacilityTypeForCheckState(selectedType ? selectedType.id : '');
    };

    //점검상태 관리 - 시설유형 변경 감지, 데이터 fetch
    useEffect(() => {
        if (selectedFacilityTypeForCheckState) {
            fetchFacilityCheckState(selectedFacilityTypeForCheckState);
            setAlert3('')
        }
    }, [selectedFacilityTypeForCheckState]);

    //점검상태(get)
    const fetchFacilityCheckState = async (facilityTypeId) => {
        const url = `${common.getApiUrl()}/admin/check-state?facilityTypeId=${facilityTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                if (response.data) {
                    const items = response.data.map((item) => ({
                        facilityTypeNm: facilityTypes.find(type => type.id === selectedFacilityTypeForCheckState)?.name,
                        facilityTypeCheckStateId: item.facilityTypeCheckStateId,
                        checkStateNm: item.checkStateNm
                    }));
                    setFacilityCheckStateItems(items);
                };
            }
        } catch (error) {
            console.error("Failed to fetch facility items:", error);
        }
    };

    //점검상태 추가 클릭
    const handleAddFacilityCheckState = () => {
        if (!selectedFacilityTypeForCheckState) {
            setAlert3('시설유형을 선택해주세요')
            return;
        }
        setNewCheckState('')
        setEditDialogType('addFacilityCheckState');
        setEditDialogOpen(true);
    };

    //점검상태 추가
    const handleCheckStateSave = async () => {
        const url = `${common.getApiUrl()}/admin/check-state`;
        const token = localStorage.getItem('access_token');

        try {
            const requestData = {
                facilityTypeId: selectedFacilityTypeForCheckState,
                checkStateNm: newCheckStateName
            };

            const response = await axios.post(url, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.data) {
                fetchFacilityCheckState(selectedFacilityTypeForCheckState);
            }
        } catch (error) {
            console.error("Failed to add facility item:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }

        setEditDialogOpen(false);
        setNewCheckState('');
    };

    //점검 상태값 수정
    const handleEditFacilityCheckStateValue = (item) => {
        setEditItem({
            facilityTypeId: selectedFacilityTypeForCheckState,//facilityType Id
            facilityTypeCheckStateId: item.facilityTypeCheckStateId,//checkState Id
            checkStateNm: item.checkStateNm, //checkState Nm
        });
        setEditDialogType('editFacilityCheckStateValue');
        setEditDialogOpen(true);
    };

    //점검상태값 삭제 클릭
    const clickRemoveFacilityCheckStateValue = (facilityTypeCheckStateId) => {
        setIsOpenAlertForFacilityCheckStateRmv(true);
        setRemoveFacilityCheckStateId(facilityTypeCheckStateId)
    };

    //점검상태값 삭제
    const handleRemoveFacilityCheckStateValue = async () => {
        const url = `${common.getApiUrl()}/admin/check-state/${removeFacilityCheckStateId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchFacilityCheckState(selectedFacilityTypeForCheckState)
            handleAlertClose();
        } catch (error) {
            console.error("Failed to delete checkState:", error);
            alert(`Error: ${error.response.data.message}`);
        }

    };

    //추가항목 토글
    const toggleFacilityAddItem = async () => {
        if (!isFacilityItemOpen) await fetchFacilityTypes();
        setSelectedFacilityTypeForAddItems('');
        setFacilityAddItems([])
        setIsFacilityItemOpen(!isFacilityItemOpen);
        setAlert2('')
    };

    //추가항목 관리 - 시설유형 선택
    const handleFacilityTypeForItemsChange = (event) => {
        const selectedType = facilityTypes.find(type => type.id === event.target.value);
        setSelectedFacilityTypeForAddItems(selectedType ? selectedType.id : '');
    };

    //추가항목 관리 - 시설유형 변경 감지, 데이터 fetch
    useEffect(() => {
        if (selectedFacilityTypeForAddItems) {
            fetchFacilityAddItems(selectedFacilityTypeForAddItems);
            setAlert2('')
        }
    }, [selectedFacilityTypeForAddItems]);

    //추가항목(get)
    const fetchFacilityAddItems = async (facilityTypeId) => {
        const url = `${common.getApiUrl()}/admin/add-item?facilityTypeId=${facilityTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const items = response.data.flatMap(item =>
                    item.facilityTypeAddItemDtls.length > 0
                        ? item.facilityTypeAddItemDtls.map(detail => ({
                            id: detail.facilityTypeAddItemDtlId,
                            facilityTypeAddItemId: item.facilityTypeAddItemId,
                            facilityTypeNm: facilityTypes.find(type => type.id === facilityTypeId)?.name,
                            name: item.addItemNm,
                            value: detail.addItemDtlNm
                        }))
                        : [{
                            id: item.facilityTypeAddItemId,
                            facilityTypeAddItemId: item.facilityTypeAddItemId, // 수정: facilityTypeAddItemId 추가
                            facilityTypeNm: facilityTypes.find(type => type.id === facilityTypeId)?.name,
                            name: item.addItemNm,
                            value: ''
                        }]
                );
                setFacilityAddItems(items);
            }
        } catch (error) {
            console.error("Failed to fetch facility items:", error);
        }
    };

    //추가항목 추가 클릭
    const handleAddFacilityAddItem = () => {
        if (!selectedFacilityTypeForAddItems) {
            setAlert2('시설유형을 선택해주세요')
            return;
        }
        setNewItemName('');
        setEditDialogType('addFacilityItem');
        setEditDialogOpen(true);
    };

    //추가항목 삭제 클릭
    const clickRemoveAddItem = (addItemId) => {
        setIsOpenAlertForAddItemRmv(true);
        setRemoveAddItemId(addItemId)
    };

    //추가항목 수정
    const handleEditItem = (item, type) => {
        setEditItem(item);
        setEditDialogType(type);
        setEditDialogOpen(true);
    };

    //추가항목 삭제 
    const handleDeleteFacilityAddItem = async () => {
        setIsOpenAlertForAddItemRmv(false);
        const url = `${common.getApiUrl()}/admin/add-item/${removeAddItemId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            await fetchFacilityAddItems(selectedFacilityTypeForAddItems); // 삭제 후 데이터 갱신
        } catch (error) {
            console.error("삭제 실패:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }
    };

    //추가항목 항목값 추가
    const handleAddFacilityItemValue = (item) => {
        setEditItem({
            id: item.id,
            facilityTypeAddItemId: item.facilityTypeAddItemId, // 수정: facilityTypeAddItemId 추가
            facilityTypeNm: item.facilityTypeNm,
            name: item.name,
            value: ''
        });
        setEditDialogType('addFacilityItemValue');
        setEditDialogOpen(true);
    };

    //추가항목 구분값 수정
    const handleEditFacilityItemValue = (item) => {
        const facilityTypeAddItemDtlId = item.id; // facilityTypeAddItemDtlId 사용
        const facilityTypeAddItemId = item.facilityTypeAddItemId;

        setEditItem({
            facilityTypeAddItemDtlId: facilityTypeAddItemDtlId,
            facilityTypeAddItemId: facilityTypeAddItemId,
            value: item.value
        });
        setEditDialogType('editFacilityItemValue');
        setEditDialogOpen(true);
    };

    //추가항목 항목값 삭제
    const handleRemoveFacilityItem = async (item) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const url = `${common.getApiUrl()}/admin/add-item-dtl/${item.id}`;
            const token = localStorage.getItem('access_token');

            try {
                await axios.delete(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchFacilityAddItems(selectedFacilityTypeForAddItems); // 삭제 후 데이터 갱신
            } catch (error) {
                console.error("시설유형별 항목 값 삭제 실패:", error);
                alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
            }
        }
    };

    //추가항목 추가
    const handleNewItemSave = async () => {
        const url = `${common.getApiUrl()}/admin/add-item`;
        const token = localStorage.getItem('access_token');

        try {
            const requestData = {
                facilityTypeId: selectedFacilityTypeForAddItems,
                addItemNm: newItemName
            };

            const response = await axios.post(url, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.data) {
                fetchFacilityAddItems(selectedFacilityTypeForAddItems);
            }
        } catch (error) {
            console.error("Failed to add facility item:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }

        setEditDialogOpen(false);
        setNewItemName('');
    };

    //민원항목 관리 토글
    const toggleFacilityComplaint = async () => {
        if (!isFacilityComplaointOpen) await fetchFacilityTypes();
        setSelectedFacilityTypeForComplaint('')
        setFacilityComplaintItems([])
        setIsFacilityComplaointOpen(!isFacilityComplaointOpen);
    };

    //민원항목 관리 - 시설유형 선택
    const handleFacilityTypeForComplaint = (event) => {
        const selectedType = facilityTypes.find(type => type.id === event.target.value);
        setSelectedFacilityTypeForComplaint(selectedType ? selectedType.id : '');
    };

    //민원항목 관리 - 시설유형 변경 감지, 데이터 fetch
    useEffect(() => {
        if (selectedFacilityTypeForComplaint) {
            fetchFacilityComplaint(selectedFacilityTypeForComplaint);
            setAlert4('')
        }
    }, [selectedFacilityTypeForComplaint]);

    //민원항목(get)
    const fetchFacilityComplaint = async (facilityTypeId) => {
        const url = `${common.getApiUrl()}/admin/complaint-item?facilityTypeId=${facilityTypeId}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const items = response.data.map((item) => ({
                    facilityTypeNm: facilityTypes.find(type => type.id === selectedFacilityTypeForComplaint)?.name,
                    complaintItemId: item.facilityTypeComplaintItemId,
                    complaintItemNm: item.complaintItemNm
                }));
                setFacilityComplaintItems(items);
            };
        } catch (error) {
            console.error("Failed to fetch facility items:", error);
        }
    };

    //민원항목 추가 클릭
    const handleAddFacilityComplaint = () => {
        if (!selectedFacilityTypeForComplaint) {
            setAlert4('시설유형을 선택해주세요')
            return;
        }
        setNewComplaint('')
        setEditDialogType('addFacilityComplaint');
        setEditDialogOpen(true);
    };

    //민원항목 추가
    const handleNewComplaintSave = async () => {
        const url = `${common.getApiUrl()}/admin/complaint-item`;
        const token = localStorage.getItem('access_token');

        try {
            const requestData = {
                facilityTypeId: selectedFacilityTypeForComplaint,
                complaintItemNm: newComplaintName
            };

            const response = await axios.post(url, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.data) {
                fetchFacilityComplaint(selectedFacilityTypeForComplaint);
            }
        } catch (error) {
            console.error("Failed to add complaint item:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }

        setEditDialogOpen(false);
        setNewComplaint('');
    };

    //민원항목값 수정
    const handleEditFacilityComplaintValue = (item) => {
        setEditItem({
            facilityTypeId: selectedFacilityTypeForComplaint,
            complaintItemId : item.complaintItemId,
            complaintItemNm : item.complaintItemNm,
        });
        setEditDialogType('editFacilityComplaintValue');
        setEditDialogOpen(true);
    };

    //민원항목값 삭제 클릭
    const clickRemoveFacilityComplaintValue = (facilityTypeCheckStateId) => {
        setIsOpenAlertForFacilityComplaintRmv(true);
        setRemoveFacilityComplaintId(facilityTypeCheckStateId)
    };

    //민원항목값 삭제
    const handleRemoveFacilityComplaintValue = async () => {
        const url = `${common.getApiUrl()}/admin/complaint-item/${removeFacilityComplaintId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchFacilityComplaint(selectedFacilityTypeForComplaint)
            handleAlertClose();
        } catch (error) {
            console.error("Failed to delete complaint-item:", error);
            alert(`Error: ${error.response.data.message}`);
        }

    };

    //아래부터 공통사용...
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditItem(null);
    };

    const handleEditDialogSave = async () => {
        const token = localStorage.getItem('access_token');

        // 시설 유형 추가
        if (editDialogType === 'addFacilityType') {
            const url = `${common.getApiUrl()}/admin/facility-type`;

            try {
                const requestData = {
                    facilityTypeNm: editItem.name
                };

                const response = await axios.post(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    setFacilityTypes([...facilityTypes, response.data]);
                    fetchFacilityTypes();
                }
            } catch (error) {
                console.error("시설 유형 추가 실패:", error);
                alert(`Error: ${error.response.data.message}`);
            }
        }
        // 시설 유형 수정
        else if (editDialogType === 'editFacilityType') {
            const url = `${common.getApiUrl()}/admin/facility-type/${editItem.id}`;

            try {
                const requestData = {
                    facilityTypeNm: editItem.name
                };

                const response = await axios.put(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    const updatedFacilityTypes = facilityTypes.map((type) =>
                        type.id === editItem.id ? { ...type, name: response.data.facilityTypeNm } : type
                    );
                    setFacilityTypes(updatedFacilityTypes);
                    fetchFacilityTypes();
                }
            } catch (error) {
                console.error("시설 분류 수정 실패:", error);
                alert(`Error: ${error.response.data.message}`);
            }
        }
        // 점검상태 관리 추가
        else if (editDialogType === 'addFacilityCheckState') {
            await handleCheckStateSave();
        }
        // 점검상태값 수정
        else if (editDialogType === 'editFacilityCheckStateValue') {
            const url = `${common.getApiUrl()}/admin/check-state/${editItem.facilityTypeCheckStateId}`;

            try {
                const requestData = {
                    facilityTypeId: editItem.facilityTypeId,
                    checkStateNm: editItem.checkStateNm
                };

                const response = await axios.put(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    fetchFacilityCheckState(selectedFacilityTypeForCheckState);
                }
            } catch (error) {
                console.error("시설유형별 항목 값 추가 실패:", error);
                alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
            }
        }
        // 추가항목 관리 추가
        else if (editDialogType === 'addFacilityItem') {
            await handleNewItemSave();
        }
        // 시설유형별 추가 관리항목 수정인 경우
        else if (editDialogType === 'facilityItem') {
            if (editItem && editItem.name && editItem.facilityTypeNm) {
                setFacilityAddItems([...facilityAddItems, { ...editItem, id: facilityAddItems.length + 1 }]);
            }
        }
        // 시설유형별 추가항목 값 추가인 경우
        else if (editDialogType === 'addFacilityItemValue') {
            const url = `${common.getApiUrl()}/admin/add-item-dtl`;

            try {
                const requestData = {
                    facilityTypeAddItemId: editItem.facilityTypeAddItemId,
                    addItemDtlNm: editItem.value
                };

                const response = await axios.post(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    fetchFacilityAddItems(selectedFacilityTypeForAddItems);
                }
            } catch (error) {
                console.error("시설유형별 항목 값 추가 실패:", error);
                alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
            }
        }

        // 시설유형별 항목 값 수정인 경우
        else if (editDialogType === 'editFacilityItemValue') {
            const url = `${common.getApiUrl()}/admin/add-item-dtl/${editItem.facilityTypeAddItemDtlId}`;

            try {
                const requestData = {
                    facilityTypeAddItemId: editItem.facilityTypeAddItemId,
                    addItemDtlNm: editItem.value
                };

                const response = await axios.put(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    fetchFacilityAddItems(selectedFacilityTypeForAddItems);
                }
            } catch (error) {
                console.error("시설유형별 항목 값 수정 실패:", error);
                alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
            }
        }
         // 민원항목 관리 추가
         else if (editDialogType === 'addFacilityComplaint') {
            await handleNewComplaintSave();
        }
        // 민원항목값 수정
        else if (editDialogType === 'editFacilityComplaintValue') {
            const url = `${common.getApiUrl()}/admin/complaint-item/${editItem.complaintItemId}`;

            try {
                const requestData = {
                    facilityTypeId: editItem.facilityTypeId,
                    complaintItemNm: editItem.complaintItemNm
                };

                const response = await axios.put(url, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response && response.data) {
                    fetchFacilityComplaint(selectedFacilityTypeForComplaint);
                }
            } catch (error) {
                console.error("민원항목 값 추가 실패:", error);
                alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
            }
        }

        setEditDialogOpen(false);
        setEditItem(null);

        handleEditDialogClose();
    };

    const handleEditChange = (field, value) => {
        setEditItem({ ...editItem, [field]: value });
    };

    const handleNewItemNameChange = (event) => {
        setNewItemName(event.target.value);
    };

    const handleNewCheckStateNameChange = (event) => {
        setNewCheckState(event.target.value);
    };

    const handleNewComplaintNameChange = (event) => {
        setNewComplaint(event.target.value);
    };

    const handleAlertClose = () => {
        setIsOpenAlertForChkTypeRmv(false);
        setIsOpenAlertForFacilityTypeRmv(false);
        setIsOpenAlertForFacilityCheckStateRmv(false)
        setIsOpenAlertForAddItemRmv(false);
        setIsOpenAlertForFacilityComplaintRmv(false);
    };

    const CustomTableCell = styled(TableCell)({
        padding: '8px 16px',
        textAlign: 'left',
        fontWeight: 'bold',
        borderRight: '1px solid #ddd',
        borderBottom: '1px solid #ddd'
    });

    const renderFacilityClassificationTable = () => (
        <Box sx={{ marginBottom: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={toggleFacilityClassification}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>시설유형 관리</Typography>
                <IconButton>
                    {isFacilityClassificationOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            {isFacilityClassificationOpen && (
                <TableContainer sx={{ maxHeight: '400px', overflow: 'auto', marginBottom: '60px' }}>
                    <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{
                                    padding: '8px 16px',
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #ddd',
                                    borderBottom: '2px solid #ddd'
                                }}></TableCell>
                                <TableCell style={{
                                    padding: '8px 16px',
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #ddd',
                                    borderBottom: '2px solid #ddd'
                                }}>시설유형명</TableCell>
                                <TableCell style={{
                                    padding: '8px 16px',
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #ddd',
                                    borderBottom: '2px solid #ddd'
                                }}>
                                    <Button variant="contained" color="primary" onClick={() => handleAddFacilityType()}
                                        sx={{ minWidth: '80px', margin: '0 4px' }}>
                                        추가
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                            {facilityTypes.map((type, index) => (
                                <TableRow key={index}>
                                    <TableCell style={{
                                        padding: '8px 16px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        borderRight: '1px solid #ddd',
                                        borderBottom: '1px solid #ddd'
                                    }}>시설유형</TableCell>
                                    <TableCell style={{
                                        padding: '8px 16px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        borderRight: '1px solid #ddd',
                                        borderBottom: '1px solid #ddd'
                                    }}>{type.name}</TableCell>
                                    <TableCell style={{
                                        padding: '8px 16px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        borderRight: '1px solid #ddd',
                                        borderBottom: '1px solid #ddd'
                                    }}>
                                        <Button variant="outlined" color="primary"
                                            onClick={() => handleEditFacilityTypeNm({ id: type.id, name: type.name })} sx={{ minWidth: '80px', margin: '0 4px' }}>
                                            수정
                                        </Button>
                                        <Button variant="outlined" color="error"
                                            onClick={() => clickRemoveFacilityType(type.id)}
                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                            삭제
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <AlertForConfirm
                open={isOpenAlertForFacilityTypeRmv}
                onClose={handleAlertClose}
                severity="warning"
                onConfirm={handleRemoveFacilityType}
                contentText="해당 시설유형을 삭제하시겠습니까?"
            />
        </Box>
    );

    const renderInspectionCategoryTable = () => {
        const mergedData = checkTypesAndItems
            .sort((a, b) => a.checkTypeId - b.checkTypeId || a.facilityTypeCheckItemId - b.facilityTypeCheckItemId)
            .reduce((rows, item) => {
                const lastRow = rows[rows.length - 1];
                const isNewCheckType = !lastRow || lastRow.checkTypeId !== item.checkTypeId;

                if (isNewCheckType) {
                    rows.push({
                        checkTypeId: item.checkTypeId,
                        checkTypeNm: item.checkTypeNm,
                        facilityTypeName: facilityTypes.find(type => type.id === selectedFacilityTypeIdForCheckTypesAndItems)?.name,
                        items: item.checkItemNm ? [item] : [],
                    });
                } else if (item.checkItemNm) {
                    lastRow.items.push(item);
                }
                return rows;
            }, []);

        // 병합된 데이터에 페이징 적용
        const paginatedMergedData = mergedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

        return (
            <Box sx={{ marginBottom: '20px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={toggleCheckTypeAndItems}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>점검항목 관리</Typography>
                    <IconButton>
                        {isCheckTypesAndItemsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
                {isCheckTypesAndItemsOpen && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel id="facility-type-select-label">시설유형</InputLabel>
                                <Select
                                    value={selectedFacilityTypeIdForCheckTypesAndItems}
                                    onChange={handleFacilityTypeChangeForCheckTypesAndItems}
                                    label="시설유형"
                                    labelId="facility-type-select-label"
                                >
                                    {facilityTypes.map((type, index) => (
                                        <MenuItem key={index} value={type.id}>{type.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {alert1 && (
                                <Alert severity="warning" sx={{ position: 'relative', left: 10, bottom: 2 }}>
                                    {alert1}
                                </Alert>
                            )}
                        </Box>
                        <TableContainer>
                            <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                                <TableHead>
                                    <TableRow>
                                        <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>시설유형</CustomTableCell>
                                        <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>점검유형</CustomTableCell>
                                        <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>점검질문</CustomTableCell>
                                        <CustomTableCell style={{ borderBottom: '2px solid #ddd', textAlign: 'center' }}>입력 방식</CustomTableCell>
                                        <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>
                                            <Button variant="contained" color="primary" onClick={handleAddCheckType}
                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                추가
                                            </Button>
                                        </CustomTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                                    {/* 병합 후 페이징 적용 */}
                                    {paginatedMergedData.length > 0 ? (
                                        paginatedMergedData.map((group, groupIndex) => (
                                            <React.Fragment key={group.checkTypeId}>
                                                {group.items.length > 0 ? (
                                                    group.items.map((item, itemIndex) => (
                                                        <TableRow key={item.facilityTypeCheckItemId}>
                                                            {itemIndex === 0 && (
                                                                <>
                                                                    <CustomTableCell rowSpan={group.items.length}>
                                                                        {group.facilityTypeName}
                                                                    </CustomTableCell>
                                                                    <CustomTableCell rowSpan={group.items.length}>
                                                                        {group.checkTypeNm}
                                                                    </CustomTableCell>
                                                                </>
                                                            )}
                                                            <CustomTableCell>{item.checkItemNm || '-'}</CustomTableCell>
                                                            <CustomTableCell>
                                                                {item.textInput === 'Y' ? (
                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>텍스트 입력</Typography>
                                                                ) : (
                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>상태값 선택</Typography>
                                                                )}
                                                            </CustomTableCell>
                                                            {itemIndex === 0 && (
                                                                <CustomTableCell rowSpan={group.items.length}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        onClick={() => handleOpenModalEditCheckTypeAndItem(group.checkTypeId)}
                                                                        sx={{ minWidth: '80px', margin: '0 4px' }}
                                                                    >
                                                                        질문 관리
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => clickRemoveCheckType(group.checkTypeId)}
                                                                        sx={{ minWidth: '80px', margin: '0 4px' }}
                                                                    >
                                                                        삭제
                                                                    </Button>
                                                                </CustomTableCell>
                                                            )}
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <CustomTableCell rowSpan={1}>
                                                            {group.facilityTypeName}
                                                        </CustomTableCell>
                                                        <CustomTableCell rowSpan={1}>
                                                            {group.checkTypeNm}
                                                        </CustomTableCell>
                                                        <CustomTableCell></CustomTableCell>
                                                        <CustomTableCell></CustomTableCell>
                                                        <CustomTableCell rowSpan={1}>
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={() => handleOpenModalEditCheckTypeAndItem(group.checkTypeId)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}
                                                            >
                                                                질문 관리
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => clickRemoveCheckType(group.checkTypeId)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}
                                                            >
                                                                삭제
                                                            </Button>
                                                        </CustomTableCell>
                                                    </TableRow>
                                                )}
                                                {groupIndex < paginatedMergedData.length - 1 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} style={{ padding: 0 }}>
                                                            <div style={{ borderBottom: '2px solid #ccc', width: '100%' }} />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '20px' }}>
                                                등록된 점검항목이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <AlertForConfirm
                            open={isOpenAlertForChkTypeRmv}
                            onClose={handleAlertClose}
                            severity="warning"
                            onConfirm={handleRemoveCheckType}
                            contentText="점검항목과 해당 점검질문들을 모두 삭제하시겠습니까?"
                        />
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                            <Pagination
                                count={Math.ceil(mergedData.length / rowsPerPage)}
                                page={page}
                                onChange={(event, newPage) => handleChangePage(event, newPage)}
                                showFirstButton
                                showLastButton
                            />
                            <Box sx={{ position: 'absolute', top: 5, left: 0 }}>
                                <TablePagination
                                    labelDisplayedRows={() => ''}
                                    component="div"
                                    page={page - 1}
                                    count={mergedData.length}
                                    rowsPerPageOptions={[10, 20]}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    ActionsComponent={() => null}
                                    onPageChange={() => null}
                                />
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    const modalEditInspection = () => (
        <Modal open={isOpenEditCheckItemModal} onClose={handleCloseModalEditCheckTypeAndItem}>
            <Box sx={{
                width: '800px',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: 24,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}>
                <Box sx={{ display: 'flex' }} mb={3}>
                    {checkTypesAndItems.length > 0 ? (
                        <Typography variant="h5" mr={1.5}>
                            {checkTypesAndItems[0].facilityType}
                        </Typography>) : null
                    }
                    <Typography variant="h6">점검 항목 추가/수정</Typography>
                </Box>
                <Typography variant="subtitle1" mb={1.5} sx={{ fontWeight: 'bold' }}>점검유형명</Typography>
                <TextField
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                    sx={{ marginBottom: '35px' }}
                    value={selectEditCheckTypeNm}
                    onChange={(e) => handleEditCheckTypeAndItemChange('', 'checkTypeNm', e.target.value)}
                />
                <Typography variant="subtitle1" mb={1.5} sx={{ fontWeight: 'bold' }}>점검질문</Typography>
                <Box>
                    {editArrayCheckTypeAndItems.length > 0 && (
                        editArrayCheckTypeAndItems
                            .filter(item => item.state !== 'delete')
                            .map((item, index) => (
                                <Box key={item.facilityTypeCheckItemId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
                                    <Box sx={{ width: '48%' }}>
                                        <TextField
                                            label={`질문 ${index + 1}`}
                                            variant="outlined"
                                            value={item.checkItemNm || ''}
                                            autoComplete="off"
                                            sx={{ width: '100%' }}
                                            onChange={(e) => handleEditCheckTypeAndItemChange(item.facilityTypeCheckItemId, 'checkItemNm', e.target.value)}
                                        />
                                    </Box>
                                    <Box>
                                        <RadioGroup
                                            row
                                            value={item.textInput}
                                            onChange={(e) => handleEditCheckTypeAndItemChange(item.facilityTypeCheckItemId, 'textInput', e.target.value)}
                                        >
                                            <FormControlLabel value="Y" control={<Radio size="small" />} label="텍스트 입력" sx={{ fontSize: '10px' }} />
                                            <FormControlLabel value="N" control={<Radio size="small" />} label="상태값 선택" sx={{ fontSize: '10px' }} />
                                        </RadioGroup>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveCheckItem(item.facilityTypeCheckItemId)}
                                        sx={{ minWidth: '80px', margin: '0 4px' }}
                                    >
                                        삭제
                                    </Button>
                                </Box>
                            ))
                    )}
                </Box>
                <Button variant="outlined" onClick={handleAddCheckItem} sx={{ marginBottom: '20px' }}>
                    질문 추가
                </Button>
                {chkTypeModalAlert && (
                    <Alert severity="warning" sx={{ position: 'relative', left: 10, bottom: 2 }}>
                        {chkTypeModalAlert}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCloseModalEditCheckTypeAndItem} sx={{ marginRight: '10px' }}>취소</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveEditCheckTypeAndItem}
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );


    const renderFacilityCheckState = () => (
        <Box sx={{ marginBottom: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={toggleFacilityCheckState}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>점검상태 관리</Typography>
                <IconButton>
                    {isFacilityCheckStateOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            {isFacilityCheckStateOpen && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <FormControl size="small" sx={{ minWidth: '200px' }}>
                            <InputLabel id='facility-type-select-label2'>시설유형</InputLabel>
                            <Select
                                value={selectedFacilityTypeForCheckState}
                                onChange={handleFacilityTypeForCheckState}
                                label="시설유형"
                                labelId='facility-type-select-label2'
                            >
                                {facilityTypes.map((type, index) => (
                                    <MenuItem key={index} value={type.id}>{type.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {alert3 && (
                            <Alert severity="warning" sx={{ position: 'relative', left: 10, bottom: 2 }}>
                                {alert3}
                            </Alert>
                        )}
                    </Box>
                    <TableContainer sx={{ maxHeight: '500px', overflow: 'auto', marginBottom: '60px' }}>
                        <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>시설유형</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>점검 상태값</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>
                                        <Button variant="contained" color="primary" onClick={handleAddFacilityCheckState}
                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                            추가
                                        </Button>
                                    </CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                                {facilityCheckStateItems.length > 0 ? (
                                    facilityCheckStateItems.map((item, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                    <CustomTableCell>{item.facilityTypeNm}</CustomTableCell>
                                                    <CustomTableCell>{item.checkStateNm}</CustomTableCell>
                                                    <CustomTableCell>
                                                        <Button variant="outlined" color="primary"
                                                            onClick={() => handleEditFacilityCheckStateValue(item)}
                                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                            수정
                                                        </Button>
                                                        <Button variant="outlined" color="error"
                                                            onClick={() => clickRemoveFacilityCheckStateValue(item.facilityTypeCheckStateId)}
                                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                            삭제
                                                        </Button>
                                                    </CustomTableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        )
                                    }))
                                    :
                                    (<TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '20px' }}>
                                            등록된 점검 상태값이 없습니다.
                                        </TableCell>
                                    </TableRow>)
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            <AlertForConfirm
                open={isOpenAlertForFacilityCheckStateRmv}
                onClose={handleAlertClose}
                severity="warning"
                onConfirm={handleRemoveFacilityCheckStateValue}
                contentText="해당 점검 상태값을 삭제하시겠습니까?"
            />
        </Box>
    );

    const renderFacilityAddItemTable = () => (
        <Box sx={{ marginBottom: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={toggleFacilityAddItem}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>추가항목 관리</Typography>
                <IconButton>
                    {isFacilityItemOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            {isFacilityItemOpen && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <FormControl size="small" sx={{ minWidth: '200px' }}>
                            <InputLabel id='facility-type-select-label2'>시설유형</InputLabel>
                            <Select
                                value={selectedFacilityTypeForAddItems}
                                onChange={handleFacilityTypeForItemsChange}
                                label="시설유형"
                                labelId='facility-type-select-label2'
                            >
                                {facilityTypes.map((type, index) => (
                                    <MenuItem key={index} value={type.id}>{type.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {alert2 && (
                            <Alert severity="warning" sx={{ position: 'relative', left: 10, bottom: 2 }}>
                                {alert2}
                            </Alert>
                        )}
                    </Box>
                    <TableContainer sx={{ maxHeight: '500px', overflow: 'auto', marginBottom: '60px' }}>
                        <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>시설유형</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>항목명</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>구분</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>
                                        <Button variant="contained" color="primary" onClick={handleAddFacilityAddItem}
                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                            추가
                                        </Button>
                                    </CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                                {facilityAddItems.length > 0 ? (
                                    facilityAddItems.map((item, index) => {
                                        const isFirstOccurrence = facilityAddItems.findIndex(i => i.name === item.name) === index;
                                        return (
                                            <React.Fragment key={index}>
                                                {isFirstOccurrence && (
                                                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                                                        <CustomTableCell>{item.facilityTypeNm}</CustomTableCell>
                                                        <CustomTableCell>{item.name}</CustomTableCell>
                                                        <CustomTableCell></CustomTableCell>
                                                        <CustomTableCell>
                                                            <Button variant="outlined" color="primary"
                                                                onClick={() => handleAddFacilityItemValue(item)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                                구분 추가
                                                            </Button>
                                                            <Button variant="outlined" color="primary"
                                                                onClick={() => handleEditItem(item, 'facilityItem')}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                                수정
                                                            </Button>
                                                            <Button variant="outlined" color="primary"
                                                                onClick={() => clickRemoveAddItem(item.facilityTypeAddItemId)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                                삭제
                                                            </Button>
                                                        </CustomTableCell>
                                                    </TableRow>
                                                )}
                                                {item.value !== '' && (
                                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <CustomTableCell>{item.facilityTypeNm}</CustomTableCell>
                                                        <CustomTableCell>{item.name}</CustomTableCell>
                                                        <CustomTableCell>{item.value}</CustomTableCell>
                                                        <CustomTableCell>
                                                            <Button variant="outlined" color="primary"
                                                                onClick={() => handleEditFacilityItemValue(item)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                                수정
                                                            </Button>
                                                            <Button variant="outlined" color="error"
                                                                onClick={() => handleRemoveFacilityItem(item)}
                                                                sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                                삭제
                                                            </Button>
                                                        </CustomTableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        )
                                    }))
                                    :
                                    (<TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '20px' }}>
                                            등록된 추가항목이 없습니다.
                                        </TableCell>
                                    </TableRow>)
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <AlertForConfirm
                        open={isOpenAlertForAddItemRmv}
                        onClose={handleAlertClose}
                        severity="warning"
                        onConfirm={handleDeleteFacilityAddItem}
                        contentText="해당 추가항목을 삭제하시겠습니까?"
                    />
                </>
            )}
        </Box>
    );

    const renderFacilityComplaint = () => (
        <Box sx={{ marginBottom: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={toggleFacilityComplaint}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>민원항목 관리</Typography>
                <IconButton>
                    {isFacilityComplaointOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            {isFacilityComplaointOpen && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <FormControl size="small" sx={{ minWidth: '200px' }}>
                            <InputLabel id='facility-type-select-label2'>시설유형</InputLabel>
                            <Select
                                value={selectedFacilityTypeForComplaint}
                                onChange={handleFacilityTypeForComplaint}
                                label="시설유형"
                                labelId='facility-type-select-label2'
                            >
                                {facilityTypes.map((type, index) => (
                                    <MenuItem key={index} value={type.id}>{type.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {alert4 && (
                            <Alert severity="warning" sx={{ position: 'relative', left: 10, bottom: 2 }}>
                                {alert4}
                            </Alert>
                        )}
                    </Box>
                    <TableContainer sx={{ maxHeight: '500px', overflow: 'auto', marginBottom: '60px' }}>
                        <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>시설유형</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>민원항목</CustomTableCell>
                                    <CustomTableCell style={{ borderBottom: '2px solid #ddd' }}>
                                        <Button variant="contained" color="primary" onClick={handleAddFacilityComplaint}
                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                            추가
                                        </Button>
                                    </CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                                {facilityComplaintItems.length > 0 ? (
                                    facilityComplaintItems.map((item, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                    <CustomTableCell>{item.facilityTypeNm}</CustomTableCell>
                                                    <CustomTableCell>{item.complaintItemNm}</CustomTableCell>
                                                    <CustomTableCell>
                                                        <Button variant="outlined" color="primary"
                                                            onClick={() => handleEditFacilityComplaintValue(item)}
                                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                            수정
                                                        </Button>
                                                        <Button variant="outlined" color="error"
                                                            onClick={() => clickRemoveFacilityComplaintValue(item.complaintItemId)}
                                                            sx={{ minWidth: '80px', margin: '0 4px' }}>
                                                            삭제
                                                        </Button>
                                                    </CustomTableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        )
                                    }))
                                    :
                                    (<TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '20px' }}>
                                            등록된 민원항목이 없습니다.
                                        </TableCell>
                                    </TableRow>)
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            <AlertForConfirm
                open={isOpenAlertForFacilityComplaintRmv}
                onClose={handleAlertClose}
                severity="warning"
                onConfirm={handleRemoveFacilityComplaintValue}
                contentText="해당 민원항목을 삭제하시겠습니까?"
            />
        </Box>
    );

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>시설 관리</Typography>
            <Box sx={{ marginTop: '30px' }}>
                {renderFacilityClassificationTable()}
                {renderInspectionCategoryTable()}
                {modalEditInspection()}
                {renderFacilityCheckState()}
                {renderFacilityAddItemTable()}
                {renderFacilityComplaint()}
            </Box>
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                <DialogTitle>
                    {editDialogType === 'addFacilityType' ? '시설유형 추가' :
                        editDialogType === 'editFacilityType' ? '시설유형 수정' :
                            editDialogType === 'addFacilityItem' ? '시설유형별 추가 항목' :
                                editDialogType === 'facilityItem' ? '추가 항목 수정' :
                                    editDialogType === 'addFacilityItemValue' ? '추가 항목 구분값 추가' :
                                        editDialogType === 'addFacilityCheckState' ? '점검상태 추가' :
                                            editDialogType === 'editFacilityCheckStateValue' ? '점검 상태값 수정' :
                                                editDialogType === 'addFacilityComplaint' ? '민원항목 추가' :
                                                    editDialogType === 'editFacilityComplaintValue' ? '민원항목값 수정' :
                                                        editDialogType === 'editFacilityItemValue' ? '시설유형별 구분값 수정' : ''}
                </DialogTitle>
                <DialogContent sx={{ mt: '10px' }}>
                    {editDialogType === 'addFacilityType' || editDialogType === 'editFacilityType' || editDialogType === 'addCheckType' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="이름"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.name || ''}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'editInspectionManagementItem' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="점검항목"
                                autoComplete="off"
                                fullWidth
                                value={editItem?.name || ''}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'addFacilityItem' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="항목명"
                                fullWidth
                                autoComplete="off"
                                value={newItemName || ''}
                                onChange={handleNewItemNameChange}
                            />
                        </>
                    ) : editDialogType === 'addFacilityCheckState' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="상태"
                                fullWidth
                                autoComplete="off"
                                value={newCheckStateName || ''}
                                onChange={handleNewCheckStateNameChange}
                            />
                        </>
                    ) : editDialogType === 'editFacilityCheckStateValue' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="상태값"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.checkStateNm || ''}
                                onChange={(e) => handleEditChange('checkStateNm', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'addFacilityItemValue' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="항목값"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.value || ''}
                                onChange={(e) => handleEditChange('value', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'editFacilityItemValue' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="항목값"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.value || ''}
                                onChange={(e) => handleEditChange('value', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'addFacilityComplaint' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="상태"
                                fullWidth
                                autoComplete="off"
                                value={newComplaintName || ''}
                                onChange={handleNewComplaintNameChange}
                            />
                        </>
                    ) : editDialogType === 'facilityItem' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="항목명"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.name || ''}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                            />
                        </>
                    ) : editDialogType === 'editFacilityComplaintValue' ? (
                        <>
                            <TextField
                                margin="dense"
                                label="항목명"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.complaintItemNm || ''}
                                onChange={(e) => handleEditChange('complaintItemNm', e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <TextField
                                margin="dense"
                                label="항목명"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.name || ''}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="구분값"
                                fullWidth
                                autoComplete="off"
                                value={editItem?.value || ''}
                                onChange={(e) => handleEditChange('value', e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} sx={{ color: 'red' }}>취소</Button>
                    <Button onClick={handleEditDialogSave} color="primary">저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default validationAuth(FacilityManagement);