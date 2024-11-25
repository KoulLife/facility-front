import React, { useEffect, useState } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Modal, Table, TableBody, IconButton, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Paper, Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as common from '../../../commons/common';
import ButtonOnTable from '../../../components/managerPage/gridTable';
import SearchArea from '../../../components/managerPage/searchArea';
import ExcelFilterModal from '../../../components/Modal/ExcelFilterModal';

const ForceRegister = () => {
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchCheckerNm, setSearchCheckerNm] = useState('');
    const [items, setItems] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState({});
    const [detailModalOpen, setDetailModalOpen] = useState(false);

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

    const url = `${common.getApiUrl()}/facility/forced-list`;
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 강제 등록 리스트 가져오기
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
            if (response.data) {
                const fetchedItems = response.data.content.map((item) => ({
                    checkRsltMstrId: item.checkRsltMstrId,
                    facilityNm: item.facilityNm || '',
                    checkerNm: item.checkerNm || '',
                    registerDt: item.registerDt,
                    checkRsltDtlList: item.checkRsltDtlList || []
                }));
                setItems(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    };

    const fetchDtlData = async (checkRsltMstrId) => {

        try {
            const response = await axios.get(`${url}/${checkRsltMstrId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setSelectedDetail(response.data)
                setDetailModalOpen(true)
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

    const handleOpenDtlModal = (checkRsltMstrId) => {
        fetchDtlData(checkRsltMstrId)
    }

    const handleCloseDtlModal = () => {
        setDetailModalOpen(false)
        setSelectedDetail({})
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>점검 강제등록</Typography>
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
                            fieldnm: '점검자명',
                            name: 'checkerNm',
                            type: 'input',
                        }
                    ]}
                    onSearchClick={handleSearchSubmit}
                // rightBtnText={"엑셀 다운로드"}
                // rightbtnbgcolor="var(--sub-excel-color)"
                // onRightBtnClick={handleExcelPopOpen}
                />
            </Box>
            <ExcelFilterModal open={isOpenExcelPop} onClose={handleExcelPopClose} excelType={'complaint'} searchParams={searchParams} />
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설명</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>점검자명</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>등록일시</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>점검기록</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <TableRow key={index} sx={{ height: '52px' }}>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.checkerNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.registerDt}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>
                                            <ButtonOnTable text="조회" onClick={() => handleOpenDtlModal(item.checkRsltMstrId)} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f5f5f5' }}>
                                        강제점검 기록이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                            {/* 빈 행을 추가하여 테이블을 균형 있게 유지 */}
                            {items.length < rowsPerPage && (
                                Array.from({ length: rowsPerPage - items.length }).map((_, index) => (
                                    <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                        <TableCell colSpan={4} sx={{ padding: '8px' }} />
                                    </TableRow>
                                ))
                            )}
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
            {selectedDetail && (
                <Modal
                    open={detailModalOpen}
                    onClose={handleCloseDtlModal}
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
                        }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                점검 기록 조회
                            </Typography>
                            <IconButton onClick={handleCloseDtlModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    {selectedDetail.facilityNm} / {selectedDetail.checkerNm} / {selectedDetail.checkTime}
                                </Typography>
                            </Box>
                            <TableContainer sx={{ marginTop: 2, backgroundColor: 'var(--main-white-color)' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center"><Typography fontWeight="bold">점검 항목</Typography></TableCell>
                                            <TableCell align="center"><Typography fontWeight="bold">상태</Typography></TableCell>
                                            <TableCell align="center"><Typography fontWeight="bold">특이사항</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedDetail.checkRsltDtlList && selectedDetail.checkRsltDtlList.length > 0 ? (
                                            selectedDetail.checkRsltDtlList.map((detail) => (
                                                <TableRow key={detail.checkRsltDtlId}>
                                                    <TableCell align="center">{detail.checkItemNm}</TableCell>
                                                    <TableCell align="center">{detail.checkRsltValNm}</TableCell>
                                                    <TableCell align="center">{detail.rm || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">상세 정보가 없습니다.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                </Modal>
            )}
        </Box>
    );
};

export default validationAuth(ForceRegister);