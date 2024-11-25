import React, { useEffect, useState } from 'react';
import validationAuth from '../../../validationAuth';
import {Box,Button,Typography,Table,TableBody,TableCell,TableContainer,
    TableHead,TablePagination,TableRow,Paper,Pagination,IconButton,Grid,Modal,Select,MenuItem,
    Snackbar,Alert} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import ExcelFilterModal from '../../../components/Modal/ExcelFilterModal';

const CustomerVoice = () => {
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchCheckerNm, setSearchCheckerNm] = useState('');
    const [items, setItems] = useState([]); //고객의 소리 리스트

    const [goToPage, setGoToPage] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null); //고객의 소리 상세 정보
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [status, setStatus] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [searchParams, setSearchParams] = useState({
        checkerNm: '',
        facilityNm: '',
        pageSize: '',
        page: '',
    });
    const [isOpenExcelPop, setIsOpenExcelPop] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 고객의 소리 리스트 가져오기
    const fetchData = async (params = {}) => {
        const url = `${common.getApiUrl()}/complaint`;
        const token = localStorage.getItem('access_token');

        const trimmedSearchParams = Object.keys(searchParams).reduce((acc, key) => {
            const value = searchParams[key];
            acc[key] = typeof value === 'string' ? value.trim() : value;
            return acc;
        }, {});

        try {
            const params = {
                facilityNm: trimmedSearchParams.facilityNm,
                checkerNm: trimmedSearchParams.checkerNm,
                page: page,
                pageSize: rowsPerPage,
            };

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params
            });
            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map((item) => ({
                    id: item.complaintId,
                    registerDt: item.registerDt || '',
                    facilityNm: item.facilityNm || '',
                    complaintContent: item.complaintContent || '',
                    complaintStateNm: item.complaintStateNm || '',
                }));
                setItems(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    };

    const handleSearchChanges = (name, value) => {
        if (name === 'facilityNm') {
            setSearchFacilityNm(value);
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
        } else if (name === 'checkerNm') {
            setSearchCheckerNm(value);
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleSearchSubmit = () => {
        setPage(1);
        fetchData();
    };

    const handleExcelPopOpen = () => {
        setIsOpenExcelPop(true)
    };

    const handleExcelPopClose = () => {
        setIsOpenExcelPop(false)
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    const handleGoToPage = (event) => {
        event.preventDefault();
        const pageNumber = parseInt(goToPage, 10);
        if (pageNumber > 0 && pageNumber <= Math.ceil(totalElements / rowsPerPage)) {
            setPage(pageNumber);
        }
        setGoToPage('');
    };

    // 고객의 소리 수정 모달 열기
    const handleOpenEditModal = async (complaintId) => {
        if (!complaintId) {
            console.error('Invalid complaintId');
            return;
        }

        try {
            const response = await axios.get(`${common.getApiUrl()}/complaint/${complaintId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            const data = response.data;
            setSelectedComplaint(data);
            setStatus(data.complaintStateVal);
            setEditModalOpen(true);
            fetchStatusOptions();
        } catch (error) {
            console.error('Error fetching complaint details:', error);
        }
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedComplaint(null);
        setStatus('');
    };

    //고객의 소리 진행 단계 가져오기(공통코드)
    const fetchStatusOptions = async () => {
        const url = `${common.getApiUrl()}/common/comCd?comMstrId=CM6`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setStatusOptions(response.data);
            }
        } catch (error) {
            console.error('진행현황 옵션을 가져오는 데 실패했습니다:', error);
        }
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleSubmit = async () => {
        const url = `${common.getApiUrl()}/complaint/${selectedComplaint.complaintId}`;
        const token = localStorage.getItem('access_token');
        const selectedOption = statusOptions.find((option) => option.comDtlVal === status);

        const data = {
            complaintId: selectedComplaint.complaintId,
            complaintStateVal: status,
            complaintStateNm: selectedOption ? selectedOption.comDtlNm : '',
        };

        try {
            await axios.put(url, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSnackbarOpen(true); // 성공 알림 표시
            handleCloseEditModal();
            fetchData(); // 데이터 새로고침
        } catch (error) {
            console.error('변경사항 저장에 실패했습니다:', error);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>고객의 소리</Typography>
            <Box sx={{ position: 'relative' }}>
                <SearchArea
                    searchValues={{ facilityNm: searchFacilityNm, checkerNm: searchCheckerNm }}
                    handleSearchChanges={(name, value) => { handleSearchChanges(name, value); }}
                    fields={[
                        {
                            fieldnm: '시설명',
                            name: 'facilityNm',
                            type: 'input',
                        },
                        {
                            fieldnm: '담당자',
                            name: 'checkerNm',
                            type: 'input',
                        }
                    ]}
                    onSearchClick={handleSearchSubmit}
                    showRightButton='true'
                    rightBtnText={"엑셀 다운로드"}
                    rightbtnbgcolor="var(--sub-excel-color)"
                    onRightBtnClick={handleExcelPopOpen}
                />
            </Box>
            <ExcelFilterModal open={isOpenExcelPop} onClose={handleExcelPopClose} excelType={'complaint'} searchParams={searchParams}/>
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설명</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>접수 항목</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>접수일시</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>진행현황</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>수정</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ height: '52px' }}>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.complaintContent}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.registerDt}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.complaintStateNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="수정" onClick={() => handleOpenEditModal(item.id)}></ButtonOnTable>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.from({ length: rowsPerPage - items.length }).map((_, index) => (
                                <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                    <TableCell colSpan={5} sx={{ padding: '8px' }} />
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
            {selectedComplaint && (
                <Modal
                    open={editModalOpen}
                    onClose={handleCloseEditModal}
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 1000,
                            bgcolor: 'var(--main-white-color)',
                            boxShadow: 24,
                            p: 3,
                            borderRadius: 2,
                            outline: 'none'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                고객의 소리 현황표 수정
                            </Typography>
                            <IconButton onClick={handleCloseEditModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                {[
                                    ['시설명', selectedComplaint.facilityNm],
                                    ['관리처',`${selectedComplaint.midDeptNm} - ${selectedComplaint.botDeptNm}`],
                                    ['접수일시', selectedComplaint.registerDt],
                                    ['고객의 소리', selectedComplaint.complaintContent],
                                ].map(([label, value], index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', py: 0 }}>
                                            <Typography sx={{ width: '30%', fontWeight: 'bold' }}>{label}</Typography>
                                            <Typography sx={{ width: '70%' }}>{value || ''}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                                        <Typography sx={{ width: '30%', fontWeight: 'bold' }}>진행 현황</Typography>
                                        <Select
                                            value={status}
                                            onChange={handleStatusChange}
                                            displayEmpty
                                            size="small"
                                            sx={{ width: '70%' }}
                                        >
                                            <MenuItem value="">선택</MenuItem>
                                            {statusOptions.map((option) => (
                                                <MenuItem key={option.comDtlId} value={option.comDtlVal}>
                                                    {option.comDtlNm}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#1E88E5',
                                        color: '#fff',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: '#1A4080',
                                        },
                                        mr: 2
                                    }}
                                    onClick={handleSubmit}
                                >
                                    변경 사항 저장
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#B1BBCC',
                                        color: '#fff',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: '#A0A9B3',
                                        }
                                    }}
                                    onClick={handleCloseEditModal}
                                >
                                    취소
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Modal>
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    변경 사항이 저장되었습니다.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default validationAuth(CustomerVoice);