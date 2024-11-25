import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TablePagination, TableHead, TableRow,
    Paper, Pagination, Modal, IconButton, Grid, CircularProgress, List, ListItem, ListItemText, Accordion, Alert, AccordionSummary, AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import * as common from '../../../commons/common';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import SearchArea from '../../../components/managerPage/searchArea';
import AlertForConfirm from '../../../components/alertForConfirm';
import FacilityDetailsModal from '../../../components/Modal/FacilityDetailsModal';
import ExcelFilterModal from '../../../components/Modal/ExcelFilterModal';

const FacilityUncheckStatus = () => {

    const [checkCycles, setCheckCycles] = useState([]);
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchCheckerNm, setSearchCheckerNm] = useState('');
    const [searchCycle, setSearchCycle] = useState('');
    const [items, setItems] = useState([]);

    const [searchParams, setSearchParams] = useState({
        facilityNm: '',
        checkerNm: '',
        checkCycle: '',
        pageSize: '',
        pageNumber: '',
    });

    const [isOpenViewModal, setIsOpenViewModal] = useState(false);//시설 조회 모달
    const [facilityIdForModal, setFacilityIdForModal] = useState('');

    const [isOpenExcelPop, setIsOpenExcelPop] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [isNoCheckerAlertOpen, setIsNoCheckerAlertOpen] = useState(false); //점검자 없음 alert
    const [checkerModalOpen, setCheckerModalOpen] = useState(false);
    const [selectedCheckers, setSelectedCheckers] = useState([]);
    const [expandedChecker, setExpandedChecker] = useState(false); //점검자 정보 펼치기

    const [goToPage, setGoToPage] = useState('');

    const token = localStorage.getItem('access_token');

    useEffect(() => { //점검주기 리스트 불러오기
        const fetchCheckCycles = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/common/check-cycle`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.data) {
                    const fetchedItems = response.data.map((cycle) => ({
                        value: cycle.code,
                        label: cycle.title,
                    }));
                    fetchedItems.unshift({ value: ' ', label: '전체' });
                    setCheckCycles(fetchedItems)
                }
            } catch (error) {
                console.error("데이터를 가져오는 데 실패했습니다:", error);
            }
        }
        fetchCheckCycles();
    }, [])

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 미점검 시설물 데이터 가져오기
    const fetchData = async () => {
        const url = `${common.getApiUrl()}/facility/unchecked`;

        const trimmedSearchParams = Object.keys(searchParams).reduce((acc, key) => {
            const value = searchParams[key];
            acc[key] = typeof value === 'string' ? value.trim() : value;
            return acc;
        }, {});

        try {
            const params = {
                facilityNm: trimmedSearchParams.facilityNm,
                checkerNm: trimmedSearchParams.checkerNm,
                checkCycle: searchParams.checkCycle,
                page: page,
                pageSize: rowsPerPage,
            };

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params,
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map((item) => ({
                    facilityId: item.facilityId,
                    facilityNm: item.facilityNm || '',
                    checkCycle: item.checkCycle || '',
                    midDeptNm: item.midDeptNm || '',
                    botDeptNm: item.botDeptNm || '',
                    facilityTypeNm: item.facilityTypeNm || '',
                    checkerNm: item.checkerNm || '',
                }));
                setItems(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error('데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    const handleExcelDownload = async () => {
        const url = `${common.getApiUrl()}/excel/facility/unchecked`;
        const trimChechCycle = searchCycle.trim()
        const parmas = {
            facilityNm: searchFacilityNm,
            checkerNm: searchCheckerNm,
            checkCycle: !trimChechCycle ? null : searchCycle
        }
        try {
            const response = await axios.post(url, parmas, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'blob'
            });
            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                let filename = '미점검현황.xlsx';

                if (contentDisposition && contentDisposition.includes('attachment')) {

                    let matches = contentDisposition.split(';').filter(str => str.includes('filename'));

                    if (!matches) {
                        matches = /filename="?([^;\n"]+)"?/.exec(contentDisposition);
                    }
                    if (matches != null && matches[0]) {
                        [, filename] = matches[0].split('=');
                        filename = decodeURIComponent(filename);
                    }
                }
                const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);  // 메모리 해제
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const handleOpenCheckerModal = async (facilityId) => {
        const checkerInfoList = await fetchCheckerInfo(facilityId);
        if (checkerInfoList && checkerInfoList.length > 0) {
            setSelectedCheckers(checkerInfoList);
        } else {
            setIsNoCheckerAlertOpen(true);
        }
        setCheckerModalOpen(true);
    };

    //점검자 상세보기
    const handleExpandChecker = (checkerId) => {
        setExpandedChecker(expandedChecker === checkerId ? false : checkerId);
    };

    useEffect(() => {
        if (selectedCheckers.length === 1) {
            setExpandedChecker(`checker-${selectedCheckers[0].facilityToCheckerId}`);
        }
    }, [selectedCheckers]);

    const handleCloseCheckerModal = () => {
        setCheckerModalOpen(false);
        setExpandedChecker(false);
        setSelectedCheckers([]);
    };

    // 점검자 정보 가져오기
    const fetchCheckerInfo = async (facilityId) => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/checker-list`, {
                params: { facilityId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            return response.data; // 전체 데이터 배열 반환
        } catch (error) {
            console.error('Error fetching checker info:', error);
            return [];
        }
    };

    //시설 조회 모달
    const handleOpenViewModal = (facilityId) => {
        setFacilityIdForModal(facilityId)
        setIsOpenViewModal(true);
    };

    //시설 조회 모달 닫기
    const handleCloseViewModal = () => {
        setIsOpenViewModal(false);
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
        } else if (name === 'checkCycle') {
            setSearchCycle(value.trim());
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value.trim(),
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
            setSearchParams((prevParams) => ({
                ...prevParams,
                pageNumber: pageNumber,
            }));
        }
        setGoToPage('');
    };

    const handleAlertClose = () => {
        setIsNoCheckerAlertOpen(false);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>미점검현황</Typography>
            <Box sx={{ position: 'relative' }}>
                <SearchArea
                    searchValues={{ facilityNm: searchFacilityNm, checkerNm: searchCheckerNm, checkCycle: searchCycle }}
                    handleSearchChanges={(name, value) => { handleSearchChanges(name, value); }}
                    fields={[
                        {
                            fieldnm: '시설명',
                            name: 'facilityNm',
                            type: 'input',
                        },
                        {
                            fieldnm: '점검자명',
                            name: 'checkerNm',
                            type: 'input',
                        },
                        {
                            fieldnm: '점검주기',
                            name: 'checkCycle',
                            type: 'select',
                            options: checkCycles
                        }
                    ]}
                    onSearchClick={handleSearchSubmit}
                    showRightButton='true'
                    rightBtnText={"엑셀 다운로드"}
                    rightbtnbgcolor="var(--sub-excel-color)"
                    onRightBtnClick={handleExcelPopOpen}
                />
                <ExcelFilterModal open={isOpenExcelPop} onClose={handleExcelPopClose} excelType={'facility/unchecked'} searchParams={searchParams} />
            </Box>
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>시설유형</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%', }}>시설명</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>점검주기</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>관리부서</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>팀</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>점검자</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>시설조회</TableCell>
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
                                        <ButtonOnTable text="조회" onClick={() => handleOpenCheckerModal(item.facilityId)}></ButtonOnTable>
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="조회" onClick={() => handleOpenViewModal(item.facilityId)}></ButtonOnTable>
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
            {selectedCheckers.length > 0 && (
                <Modal
                    open={checkerModalOpen}
                    onClose={handleCloseCheckerModal}
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
                            outline: 'none',
                            maxHeight: '60vh',
                            overflowY: 'auto',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                점검자 조회
                            </Typography>
                            <IconButton onClick={handleCloseCheckerModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {selectedCheckers.map((checker) => (
                                <Accordion
                                    disableGutters
                                    key={checker.facilityToCheckerId}
                                    expanded={expandedChecker === `checker-${checker.facilityToCheckerId}`}
                                    onChange={() => handleExpandChecker(`checker-${checker.facilityToCheckerId}`)}
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        boxShadow: 'none',
                                        marginBottom: '10px',
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', }}
                                    >
                                        <Typography sx={{ flexGrow: 1 }}>{checker.checkerNm}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <List dense>
                                                    <ListItem>
                                                        <ListItemText primary="이름" secondary={checker.checkerNm || ''} />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText primary="휴대폰 번호" secondary={checker.phone || ''} />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText primary="이메일" secondary={checker.email || '-'} />
                                                    </ListItem>
                                                </List>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <List dense>
                                                    <ListItem>
                                                        <ListItemText primary="담당" secondary={checker.deptNm || '-'} />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText primary="직위" secondary={checker.position || ''} />
                                                    </ListItem>
                                                </List>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Box>
                </Modal>
            )}
            <AlertForConfirm
                open={isNoCheckerAlertOpen}
                onClose={handleAlertClose}
                onConfirm={handleAlertClose}
                contentText="해당 시설에 점검자가 없습니다."
                showCancel={false}
            />
            <FacilityDetailsModal open={isOpenViewModal} onClose={handleCloseViewModal} facilityId={facilityIdForModal} />
        </Box >
    );
};

export default validationAuth(FacilityUncheckStatus);