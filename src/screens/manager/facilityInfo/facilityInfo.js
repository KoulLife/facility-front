import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    TablePagination,
    styled,
} from '@mui/material';
import axios from 'axios';
import * as common from '../../../commons/common';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import SearchArea from '../../../components/managerPage/searchArea';
import FacilityManagerAssignModal from './facilityManagerAssignModal';
import FacilityDetailsModal from '../../../components/Modal/FacilityDetailsModal';
import { BorderAllRounded } from '@mui/icons-material';

const FacilityInfo = () => {
    const navigate = useNavigate();
    const [facilityTypes, setFacilityTypes] = useState([]);
    const [searchFacilityTypeId, setSearchFacilityTypeId] = useState('');
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchCheckerNm, setSearchCheckerNm] = useState('');
    const [items, setItems] = useState([]);
    const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);//담당 등록 모달
    const [isOpenViewModal, setIsOpenViewModal] = useState(false);//시설 조회 모달
    const [facilityIdForModal, setFacilityIdForModal] = useState('');

    const [searchParams, setSearchParams] = useState({
        facilityTypeId: '',
        facilityNm: '',
        checkerNm: '',
        pageSize: '',
        pageNumber: '',
    });

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        getFacilityType();
        setSearchFacilityTypeId('')
        setSearchFacilityNm('')
        setSearchCheckerNm('')
    }, []);

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 시설 정보 리스트
    const fetchData = async () => {
        const url = `${common.getApiUrl()}/facility`;
        const token = localStorage.getItem('access_token');

        const trimmedSearchParams = Object.keys(searchParams).reduce((acc, key) => {
            const value = searchParams[key];
            acc[key] = typeof value === 'string' ? value.trim() : value;
            return acc;
        }, {});

        try {
            const params = {
                facilityTypeId: trimmedSearchParams.facilityTypeId,
                facilityNm: trimmedSearchParams.facilityNm,
                checkerNm: trimmedSearchParams.checkerNm,
                page: page,
                pageSize: rowsPerPage,
            };

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map((item) => ({
                    facilityId: item.facilityId,
                    midDeptNm: item.midDeptNm || '',
                    botDeptNm: item.botDeptNm || '',
                    facilityNm: item.facilityNm || '',
                    facilityTypeNm: item.facilityTypeNm || '',
                    checkCycle : item.checkCycle,
                    checkerNm: item.checkerNm || '',
                    checkerId: item.checkerId,
                    checkTime: item.checkTime || '',
                    checkItems: item.checkItems || [],
                }));
                setItems(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error('데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem('facilitySearchState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            setSearchFacilityNm(parsedState.searchFacilityNm || '');
            setSearchCheckerNm(parsedState.searchCheckerNm || '');
            // setCurrentPage(parsedState.currentPage || 1);
            fetchData();

            // 상태를 복원한 후 localStorage 초기화
            localStorage.removeItem('facilitySearchState');
        } else {
            // 초기 데이터 로드
            fetchData();
        }
    }, []);

    // 페이지를 떠날 때 현재 상태 저장
    // useEffect(() => {
    //     return () => {
    //         const stateToSave = {
    //             searchFacilityNm,
    //             searchCheckerNm,
    //         };
    //         localStorage.setItem('facilitySearchState', JSON.stringify(stateToSave));
    //     };
    // }, [searchFacilityNm, searchCheckerNm]);

    const handleEditClick = (facilityId) => {
        navigate(`/manager/facility-registration-edit/${facilityId}`);
        const stateToSave = {
            searchFacilityNm,
            searchCheckerNm,
        };
        localStorage.setItem('facilitySearchState', JSON.stringify(stateToSave));
    };

    //담당 등록 모달
    const handleOpenAssignModal = (facilityId) => {
        setFacilityIdForModal(facilityId)
        setIsOpenAssignModal(true);
    };

    //담당 등록 모달 닫기
    const handleCloseAssignModal = () => setIsOpenAssignModal(false);

    //시설 조회 모달
    const handleOpenViewModal = (facilityId) => {
        setFacilityIdForModal(facilityId)
        setIsOpenViewModal(true);
    };

    //시설 조회 모달 닫기
    const handleCloseViewModal = () => {
        setIsOpenViewModal(false);
    };

    // 시설유형 리스트
    const getFacilityType = async () => {
        const url = `${common.getApiUrl()}/facility-type`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && Array.isArray(response.data)) {
                const fetchedItems = response.data.map((type) => ({
                    value: type.facilityTypeId,
                    label: type.facilityTypeNm,
                }));
                fetchedItems.unshift({ value: ' ', label: '전체' });
                setFacilityTypes(fetchedItems);
            }
        } catch (error) {
            console.error('데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    const handleSearchParamsChange = (name, value) => {
        if (name === 'checkerNm') {
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
            setSearchCheckerNm(value);
        } else if (name === 'facilityNm') {
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
            setSearchFacilityNm(value);
        } else if (name === 'facilityTypeId') {
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
            setSearchFacilityTypeId(value);
        }
    };

    const handleSearchSubmit = () => {
        setPage(1);
        fetchData();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    const CustomHeadCell = styled(TableCell)({ textAlign: 'center', fontWeight: 'bold' })

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>시설 설정</Typography>
            <SearchArea
                searchValues={{ facilityTypeId: searchFacilityTypeId, facilityNm: searchFacilityNm, checkerNm: searchCheckerNm }}
                handleSearchChanges={(name, value) => { handleSearchParamsChange(name, value); }}
                fields={[
                    {
                        fieldnm: '시설유형',
                        name: 'facilityTypeId',
                        type: 'select',
                        options: facilityTypes
                    },
                    {
                        fieldnm: '시설명',
                        name: 'facilityNm',
                        type: 'input',
                    },
                    {
                        fieldnm: '점검자명',
                        name: 'checkerNm',
                        type: 'input',
                    }
                ]}
                onSearchClick={handleSearchSubmit}
                showRightButton='true'
                rightBtnText="시설등록"
                rightbtnbgcolor="var(--sub-darkblue-color)"
                onRightBtnClick={() => navigate('/manager/facility-registration')}
            />
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <CustomHeadCell sx={{ width: '10%' }}>시설유형</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '15%' }}>시설명</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '15%' }}>점검주기</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '10%' }}>관리부서</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '10%' }}>팀</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '10%' }}>담당 등록</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '10%' }}>시설 조회</CustomHeadCell>
                                <CustomHeadCell sx={{ width: '10%' }}>수정</CustomHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ height: '52px' }}>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityTypeNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.checkCycle}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.midDeptNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.botDeptNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="등록" onClick={() => handleOpenAssignModal(item.facilityId)}></ButtonOnTable>
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="조회" onClick={() => handleOpenViewModal(item.facilityId)}></ButtonOnTable>
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="수정" onClick={() => handleEditClick(item.facilityId)}></ButtonOnTable>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.from({ length: rowsPerPage - items.length }).map((_, index) => (
                                <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                    <TableCell colSpan={8} sx={{ padding: '8px' }} />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, }}>
                    <Box>
                        <Pagination
                            count={Math.ceil(totalElements / rowsPerPage)}
                            page={page}
                            onChange={(event, newPage) => handleChangePage(event, newPage)}
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                    <Box sx={{ position: 'absolute', top: 5, left: 0 }}>
                        <TablePagination
                            labelDisplayedRows={() => ''}
                            component="div"
                            page={page - 1}
                            count={totalElements}
                            rowsPerPageOptions={[10, 25, 50]}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            ActionsComponent={() => null}
                            onPageChange={() => null}
                        />
                    </Box>
                </Box>
            </Paper>
            <FacilityManagerAssignModal open={isOpenAssignModal} onClose={handleCloseAssignModal} facilityId={facilityIdForModal} />
            <FacilityDetailsModal open={isOpenViewModal} onClose={handleCloseViewModal} facilityId={facilityIdForModal} />
        </Box>
    );
};

export default validationAuth(FacilityInfo);