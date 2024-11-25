import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {Box,Button,Typography,TextField,Table,TableBody,TableCell,TableContainer,TablePagination,
    TableHead,TableRow,Paper,Pagination,Modal,IconButton,Grid,Select,
    MenuItem,Snackbar,Alert,} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import ExcelFilterModal from '../../../components/Modal/ExcelFilterModal';

const AS = () => {
    const [searchFacilityNm, setSearchFacility] = useState('');
    const [items, setItems] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [beforeData, setBeforeData] = useState({});
    const [afterData, setAfterData] = useState({});
    const [progressOptions, setProgressOptions] = useState([]);
    const [progressItems, setProgressItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [goToPage, setGoToPage] = useState('');

    const [searchParams, setSearchParams] = useState({
        facilityNm: '',
        pageSize: '',
        page: '',
    });

    const [isOpenExcelPop, setIsOpenExcelPop] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 고장A/S 리스트 가져오기
    const fetchData = async () => {
        const url = `${common.getApiUrl()}/issue`;
        const token = localStorage.getItem('access_token');

        try {
            const queryParams = new URLSearchParams({
                facilityNm: searchParams.facilityNm || '',
                pageSize: rowsPerPage,
                page: page
            }).toString();

            const response = await axios.get(`${url}?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map(item => ({
                    issuesId: item.issuesId,
                    checkTime: item.checkTime || '',
                    botDeptNm: item.botDeptNm || '',
                    facilityNm: item.facilityNm || '',
                    issueContent: item.issueContent || '',
                    lastStateNm: item.lastStateNm || '',
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
            setSearchFacility(value);
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
        fetchData();
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
            setCurrentPage(pageNumber);
            setPage(pageNumber);
            fetchData({
                facilityNm: searchFacilityNm,
                page: pageNumber,
                pageSize: rowsPerPage
            });
        }
        setGoToPage('');
    };

    // 고장A/S 수정 모달 open
    const handleOpenEditModal = async (issuesId) => {
        if (!issuesId) {
            console.error('Invalid issuesId');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const beforeResponse = await axios.get(`${common.getApiUrl()}/issue/${issuesId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setBeforeData(beforeResponse.data);

            const afterResponse = await axios.get(`${common.getApiUrl()}/issue/resolve/${issuesId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setAfterData(afterResponse.data);

            const optionsResponse = await axios.get(`${common.getApiUrl()}/common/comCd?comMstrId=CM3`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setProgressOptions(optionsResponse.data);

            if (beforeResponse.data.issueStateList && beforeResponse.data.issueStateList.length > 0) {
                setProgressItems(beforeResponse.data.issueStateList.map(item => ({
                    issuesStateId: item.issuesStateId,
                    status: item.stateNm,
                    processContent: item.content,
                    checkTime: item.registerDt || new Date().toISOString(),
                })));
            } else {
                setProgressItems([{
                    status: beforeResponse.data.lastStateNm || '',
                    processContent: '',
                    checkTime: beforeResponse.data.checkTime || new Date().toISOString(),
                }]);
            }

            setSelectedIssue(beforeResponse.data);
            setEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching issue details:', error);
        }
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedIssue(null);
        setBeforeData({});
        setAfterData({});
        setProgressItems([]);
    };

    const handleStatusChange = (index, event) => {
        const newProgressItems = [...progressItems];
        newProgressItems[index].status = event.target.value;
        setProgressItems(newProgressItems);
    };

    const handleProcessContentChange = (index, event) => {
        const newProgressItems = [...progressItems];
        newProgressItems[index].processContent = event.target.value;
        setProgressItems(newProgressItems);
    };

    // 진행 상황 항목 추가
    const handleAddProgressItem = () => {
        const currentTime = new Date().toISOString();
        setProgressItems([...progressItems, { status: '', processContent: '', checkTime: currentTime }]);
    };

    // 진행 상황 항목 삭제
    const handleRemoveProgressItem = async (index) => {
        const confirmDelete = window.confirm('정말 삭제하시겠습니까?');

        if (confirmDelete) {
            try {
                const token = localStorage.getItem('access_token');

                if (progressItems[index].issuesStateId) {
                    const url = `${common.getApiUrl()}/issue/state/${progressItems[index].issuesStateId}`;
                    await axios.delete(url, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                }

                const newProgressItems = [...progressItems];
                newProgressItems.splice(index, 1);
                setProgressItems(newProgressItems);
            } catch (error) {
                console.error('항목 삭제 중 오류가 발생했습니다:', error);
            }
        }
    };

    // 조회/수정 모달 저장 (진행 상황)
    const handleSubmit = async (index) => {
        try {
            const stateData = {
                stateVal: progressOptions.find(option => option.comDtlNm === progressItems[index].status)?.comDtlVal || '',
                stateNm: progressItems[index].status,
                content: progressItems[index].processContent,
            };

            const token = localStorage.getItem('access_token');

            if (progressItems[index].issuesStateId) {
                const url = `${common.getApiUrl()}/issue/state/${progressItems[index].issuesStateId}`;
                await axios.put(url, stateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } else {
                const url = `${common.getApiUrl()}/issue/state`;
                await axios.post(url, {
                    ...stateData,
                    issuesId: beforeData.issuesId,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }

            setSnackbarMessage('저장되었습니다.');
            setSnackbarOpen(true);
            fetchData();
        } catch (error) {
            console.error('변경 사항 저장 중 오류가 발생했습니다:', error);
            setSnackbarMessage('저장 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
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
            <Typography variant='h6'>고장 A/S 현황</Typography>
            <Box sx={{ position: 'relative' }}>
                <SearchArea
                    searchValues={{ facilityNm: searchFacilityNm }}
                    handleSearchChanges={(name, value) => { handleSearchChanges(name, value) }}
                    fields={[
                        {
                            fieldnm: '시설명',
                            name: 'facilityNm',
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
            <ExcelFilterModal open={isOpenExcelPop} onClose={handleExcelPopClose} excelType={'issue'} searchParams={searchParams}/>
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설명</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>팀</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>내용</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>등록일시</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>진행상태</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>조회</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ height: '52px' }}>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.botDeptNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.issueContent}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.checkTime}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.lastStateNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="조회" onClick={() => handleOpenEditModal(item.issuesId)}></ButtonOnTable>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.from({ length: rowsPerPage - items.length }).map((_, index) => (
                                <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                    <TableCell colSpan={7} sx={{ padding: '8px' }} />
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
            {selectedIssue && (
                <Modal open={editModalOpen} onClose={handleCloseEditModal}>
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
                            borderRadius: 5,
                            outline: 'none',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                고장 A/S 현황표
                            </Typography>
                            <IconButton onClick={handleCloseEditModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ mb: 2, display: 'flex', }}>
                            {[
                                ['시설명 :', beforeData.facilityNm],
                            ].map(([label, value], index) => (
                                <Box key={index} sx={{ display: 'flex', mr: 1 }}>
                                    <Typography variant="body1" sx={{}}>
                                        {label}
                                    </Typography>
                                    <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                                        {value || ''}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
                            <Grid container spacing={3}>
                                {/* 개선 이전 */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>개선 이전</Typography>
                                    <Box sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Paper elevation={0} sx={{
                                                    minHeight: '200px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {beforeData.issueImgSrc && beforeData.issueImgSrc.length > 0 ? (
                                                        <img src={`${common.getImageBaseUrl()}${beforeData.issueImgSrc[0]}`}
                                                            alt="Before"
                                                            style={{
                                                                maxWidth: '180px',
                                                                objectFit: 'contain'
                                                            }} />
                                                    ) : (
                                                        <Typography variant="body1">이미지가 없습니다.</Typography>
                                                    )}
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {[
                                                    ['등록일시', beforeData.checkTime],
                                                    ['점검자', beforeData.checkerNm],
                                                    ['내용', beforeData.issueContent],
                                                ].map(([label, value], index) => (
                                                    <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                                        <Typography variant="body2" sx={{ width: '100px', position: 'relative' }}>
                                                            {label}
                                                            <span style={{ position: 'absolute', right: 0 }}>:</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                            {value || ''}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                {afterData && Object.keys(afterData).length > 0 && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>개선 이후</Typography>
                                        <Box sx={{ p: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Paper elevation={0} sx={{
                                                        minHeight: '200px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        {afterData.resolveImgSrc && afterData.resolveImgSrc.length > 0 ? (
                                                            <img
                                                                src={`${common.getImageBaseUrl()}${afterData.resolveImgSrc[0]}`}
                                                                alt="After"
                                                                style={{
                                                                    maxWidth: '180px',
                                                                    objectFit: 'contain'
                                                                }} />
                                                        ) : (
                                                            <Typography variant="body1">이미지가 없습니다.</Typography>
                                                        )}
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {[
                                                        ['등록일시', afterData.resolveTime],
                                                        ['점검자', afterData.checkerNm],
                                                        ['조치내용', afterData.resolveContent],
                                                    ].map(([label, value], index) => (
                                                        <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                                            <Typography variant="body2" sx={{ width: '100px', position: 'relative' }}>
                                                                {label}
                                                                <span style={{ position: 'absolute', right: 0 }}>:</span>
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                                {value || ''}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                            {/* 진행 상황 */}
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>진행 상황</Typography>
                            <Paper elevation={0} sx={{ my: 2, overflowY: 'auto' }}>
                                {progressItems.map((item, index) => (
                                    <Grid container alignItems="center" key={index} spacing={1} sx={{ mb: 1 }}>
                                        <Grid item xs={1}>
                                            <Typography>{String(index + 1).padStart(2, '0')}</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Select
                                                fullWidth
                                                size="small"
                                                value={item.status}
                                                onChange={(event) => handleStatusChange(index, event)}
                                                displayEmpty
                                            >
                                                <MenuItem value="">선택</MenuItem>
                                                {progressOptions.map((option) => (
                                                    <MenuItem key={option.comDtlId} value={option.comDtlNm}>
                                                        {option.comDtlNm}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography>{formatDate(item.checkTime)}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={item.processContent || ''}
                                                autoComplete="off"
                                                onChange={(event) => handleProcessContentChange(index, event)}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#1E88E5',
                                                    color: '#fff',
                                                    boxShadow: 'none',
                                                    '&:hover': { backgroundColor: '#1A4080' },
                                                    padding: '2px 4px',
                                                    minWidth: '70px',
                                                    fontSize: '1.0rem',
                                                }}
                                                onClick={() => handleSubmit(index)}
                                            >
                                                저장
                                            </Button>
                                        </Grid>
                                        <Grid item xs={2}>
                                            {index === progressItems.length - 1 && (
                                                <IconButton
                                                    sx={{
                                                        color: '#1E88E5',
                                                        boxShadow: 'none',
                                                        '&:hover': { color: '#1A4080' },
                                                    }}
                                                    onClick={handleAddProgressItem}
                                                >
                                                    <AddCircleOutlineIcon />
                                                </IconButton>
                                            )}
                                            {index > 0 && (
                                                <IconButton
                                                    sx={{
                                                        color: '#1E88E5',
                                                        boxShadow: 'none',
                                                        '&:hover': { color: '#1A4080' },
                                                    }}
                                                    onClick={() => handleRemoveProgressItem(index)}
                                                >
                                                    <RemoveCircleOutlineIcon />
                                                </IconButton>
                                            )}
                                        </Grid>
                                    </Grid>
                                ))}
                            </Paper>
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
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default validationAuth(AS);