import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TablePagination, TableHead, TableRow, Paper, Pagination, IconButton, Card, CardContent, CircularProgress } from '@mui/material';
import { GridView as GridViewIcon, ViewList as ViewListIcon } from '@mui/icons-material';
import axios from 'axios';
import * as common from '../../../commons/common';
import { useNavigate } from 'react-router-dom';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import SearchArea from '../../../components/managerPage/searchArea';
import FacilityDetailsModal from '../../../components/Modal/FacilityDetailsModal';
import ExcelFilterModal from '../../../components/Modal/ExcelFilterModal';

const FacilityCheckStatus = () => {
    const navigate = useNavigate();

    const [checkCycles, setCheckCycles] = useState([]);
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchCheckerNm, setSearchCheckerNm] = useState('');
    const [searchCycle, setSearchCycle] = useState('');

    const [searchParams, setSearchParams] = useState({
        facilityNm: '',
        checkerNm: '',
        checkCycle: '',
        pageSize: '',
        pageNumber: '',
    });
    const [items, setItems] = useState([]);
    const [goToPage, setGoToPage] = useState('');
    const [viewMode, setViewMode] = useState('card');

    const [isOpenViewModal, setIsOpenViewModal] = useState(false); //시설 조회 모달
    const [facilityIdForModal, setFacilityIdForModal] = useState('');

    const [isOpenExcelPop, setIsOpenExcelPop] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

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

    const fetchData = async () => {
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

            const response = await axios.get(`${common.getApiUrl()}/facility`, {
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
                    checkResult: item.checkCycle === '없음' ? '점검주기 없음' : item.checkResult,
                    checkProgress: item.checkProgress || '',
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
        } else if (name === 'checkCycle') {
            setSearchCycle(value.trim());
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value.trim(),
            }));
        }
    };

    const CustomCardContent = styled(CardContent)({
        padding: '10px !important',
        display: 'flex',
        flexDirection: 'column'
    });

    const FacilityCard = ({ item }) => (
        <Card
            sx={{
                width: 220,
                height: 100,
                margin: '10px',
                border: '1px solid #D6D8DC',
                borderRadius: '10px',
                boxShadow: 'none',
                '&:hover': { cursor: 'pointer', boxShadow: 'none' },
            }}
            onClick={() => handleProgressClick(item.facilityId)}
        >
            <CustomCardContent>
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            fontSize: '1.1rem',
                            textAlign: 'center',
                            color: '#2F5CA4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%' // 추가: 부모 요소가 명확한 크기를 갖도록 설정
                        }}
                    >
                        {item.facilityNm}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth:'50%'}}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.95rem',
                                textAlign: 'left',
                                color: '#2E2E2E',
                                pl: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%' // 추가: 부모 요소가 명확한 크기를 갖도록 설정
                            }}
                        >
                            {item.midDeptNm}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.95rem',
                                textAlign: 'left',
                                color: '#2E2E2E',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                pl: 1,
                                maxWidth: '100%' // 추가: 부모 요소가 명확한 크기를 갖도록 설정
                            }}>
                            {item.botDeptNm}
                        </Typography>
                    </Box>
                    <Box >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 5px', borderRadius: '10px', backgroundColor: item.checkResult === '미점검' ? '#FFE9E4' : (item.checkResult === '점검주기 없음' ? '#e0e0e0' : '#E0F1FF') }}>
                            <Box
                                sx={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: item.checkResult === '미점검' ? '#FA5D3A' : (item.checkResult === '점검주기 없음' ? '#ccc' : '#4287FA'),
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    color: '#2E2E2E',
                                    fontWeight: 'bold',
                                    pl: 0.5,
                                }}
                            >
                                {item.checkResult}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CustomCardContent>
        </Card>
    );

    const handleSearchSubmit = () => {
        setPage(1);
        fetchData()
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

    //시설 조회 모달
    const handleOpenViewModal = (facilityId) => {
        setFacilityIdForModal(facilityId)
        setIsOpenViewModal(true);
    };

    //시설 조회 모달 닫기
    const handleCloseViewModal = () => {
        setIsOpenViewModal(false);
    };

    const handleProgressClick = (facilityId) => {
        navigate(`/manager/status/check/sheet/${facilityId}`);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>점검현황</Typography>
            <Box sx={{ position: 'relative' }}>
                <SearchArea
                    searchValues={{ facilityNm: searchFacilityNm, checkerNm: searchCheckerNm, checkCycle: searchCycle, }}
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
            </Box>
            <ExcelFilterModal open={isOpenExcelPop} onClose={handleExcelPopClose} excelType={'facility/checkResult'} searchParams={searchParams} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                <Box sx={{ display: 'flex' }}>
                    <IconButton onClick={() => setViewMode('card')}>
                        <GridViewIcon />
                    </IconButton>
                    <IconButton onClick={() => setViewMode('table')}>
                        <ViewListIcon />
                    </IconButton>
                </Box>
                {viewMode === 'table' ? (
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
                                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>점검상태</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', }}>점검현황</TableCell>
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
                                                <Button
                                                    // variant="contained"
                                                    disableRipple
                                                    size="small"
                                                    sx={{
                                                        boxShadow: 'none',
                                                        backgroundColor: '#EAEEF4',
                                                        color: item.checkResult === '점검완료' ? 'var(--main-blue-color)' : (item.checkResult === '미점검' ? '#FA5D3A;' : '#8A8D8F'),
                                                        padding: '2px 4px',
                                                        '&:hover': { boxShadow: 'none', backgroundColor: '#EAEEF4' },
                                                        minWidth: '60px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'default',
                                                    }}
                                                >
                                                    {item.checkResult}
                                                </Button>
                                            </TableCell>
                                            <TableCell align="center" sx={{ padding: '4px' }}>
                                                <ButtonOnTable text="조회" onClick={() => handleProgressClick(item.facilityId)}></ButtonOnTable>
                                            </TableCell>
                                            <TableCell align="center" sx={{ padding: '4px' }}>
                                                <ButtonOnTable text="조회" onClick={() => handleOpenViewModal(item.facilityId)}></ButtonOnTable>
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
                                    onPageChange={() => null} />
                            </Box>
                        </Box>
                    </Paper>
                ) : (
                    <Paper sx={{ width: '100%', minHeight: '500px', overflow: 'hidden', marginTop: '10px', padding: '15px 10px', bgcolor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <FacilityCard
                                        key={index}
                                        item={item}
                                        handleProgressClick={handleProgressClick}
                                    />
                                ))
                            ) : (
                                <Box sx={{ width: '100%', pad: '30px' }}>
                                    <Typography variant='subtitle1' sx={{ color: 'rgb(112, 112, 112)' }}>점검 현황 데이터가 없습니다</Typography>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
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
                )}
                <FacilityDetailsModal open={isOpenViewModal} onClose={handleCloseViewModal} facilityId={facilityIdForModal} />
            </Box>
        </Box>
    );
};

export default validationAuth(FacilityCheckStatus);
