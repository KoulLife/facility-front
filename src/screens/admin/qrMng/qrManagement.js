import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, TablePagination, Dialog,
    DialogActions, DialogContent, DialogTitle, IconButton, Pagination,
    useMediaQuery, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea'

const QRManagement = () => {
    const theme = useTheme();
    const [alert, setAlert] = useState('');
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [facilityTypes, setFacilityTypes] = useState([]);

    const [searchFacilityTypeId, setSearchFacilityTypeId] = useState('');
    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [searchParams, setSearchParams] = useState({
        facilityTypeId: '',
        facilityNm: '',
        pageSize: '',
        pageNumber: '',
    });
    const [qrList, setQRList] = useState([]);

    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedQrType, setSelectedQrType] = useState('COMPLAINT'); // 민원용 점검자용 구분
    const [selectedQrDetailInfo, setSelectedQrDetailInfo] = useState({}); //qr 조회 선택 detail info

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
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
        getFacilityType();
    }, []);

    useEffect(() => {
        fetchQRList();
    }, [page, rowsPerPage]);

    // facility 리스트 가져오기
    const fetchQRList = async () => {
        const token = localStorage.getItem('access_token');
        const url = `${common.getApiUrl()}/admin/facility`;
        try {
            const params = {
                facilityTypeId: searchParams.facilityTypeId,
                facilityNm: searchParams.facilityNm,
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
                setQRList(response.data.content);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch qrList:", error);
        }
    };

    const handleSearchParamsChange = (name, value) => {
        if (name === 'facilityTypeId') {
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value.trim(),
            }));
            setSearchFacilityTypeId(value.trim());
        } else if (name === 'facilityNm') {
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
            setSearchFacilityNm(value);
        }
    };

    const handleSearch = async () => {
        setPage(1);
        fetchQRList();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    // QR 조회 클릭
    const handleOpenQRModal = async (selectedfacilityId, qrType) => {
        try {
            setSelectedQrType(qrType)
            const token = localStorage.getItem('access_token');
            const url = `${common.getApiUrl()}/facility/qr-image`;
            const response = await axios.get(url, {
                params: {
                    facilityId: selectedfacilityId,
                    qrType: qrType
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data) {
                const item = qrList.find(item => item.facilityId === selectedfacilityId)
                setSelectedQrDetailInfo(prevState => ({
                    ...prevState,
                    facilityId: item.facilityId,
                    facilityNm: item.facilityNm,
                    complaintQrUrl: item.complaintQrUrl,
                    checkerQrUrl: item.checkerQrUrl,
                    qrImageUrl: response.data.qrImageUrl !== null ? `${common.getImageBaseUrl()}${response.data.qrImageUrl}` : '',
                }));
            } else {
                const item = qrList.find(item => item.facilityId === selectedfacilityId)
                setSelectedQrDetailInfo(prevState => ({
                    ...prevState,
                    facilityId: item.facilityId,
                    facilityNm: item.facilityNm,
                }));
            }
            setQrModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch qr data:", error);
        }
    };

    const handleGenerateQr = async (facilityId, qrType) => {
        try {
            const response = await axios.post(`${common.getApiUrl()}/facility/qr-image`, {
                facilityId: facilityId,
                qrType: qrType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            setSelectedQrDetailInfo(prev => ({
                ...prev,
                qrImageUrl: `${common.getImageBaseUrl()}${response.data.qrImageUrl}`,
                checkerQrUrl: ''
            }));
            setAlert('QR 코드가 발행되었습니다.')
            fetchQRList()
        } catch (error) {
            setAlert('QR 코드 발행을 실패했습니다.')
        }
    }

    const handleCloseQrModal = () => {
        setAlert('')
        setSelectedQrDetailInfo({});
        setQrModalOpen(false);
    };

    return (
        <>
            <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>QR 관리</Typography>
                <SearchArea
                    searchValues={{ facilityNm: searchFacilityNm, facilityTypeId: searchFacilityTypeId }}
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
                    ]}
                    onSearchClick={handleSearch}
                />
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader sx={{ padding: '0 10px' }}>
                            <TableHead sx={{ backgroundColor: '#fff' }}>
                                <TableRow sx={{ height: '57px' }}>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>시설유형</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>시설명</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>관리본부</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>관리부서</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>팀</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>민원인 QR</TableCell>
                                    <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>점검자 QR</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#fff' }}>
                                {qrList.map((item, index) => (
                                    <TableRow key={item.facilityId || index} sx={{ height: '24px' }}>
                                        <TableCell align="center" sx={{ width: '15%', padding: '8px', color: 'rgb(112, 112, 112)' }}>{item.facilityTypeNm}</TableCell>
                                        <TableCell align="center" sx={{ width: '20%', padding: '8px', color: 'rgb(112, 112, 112)' }}>{item.facilityNm}</TableCell>
                                        <TableCell align="center" sx={{ width: '13%', padding: '8px', color: 'rgb(112, 112, 112)' }}>{item.topDeptNm}</TableCell>
                                        <TableCell align="center" sx={{ width: '13%', padding: '8px', color: 'rgb(112, 112, 112)' }}>{item.midDeptNm}</TableCell>
                                        <TableCell align="center" sx={{ width: '13%', padding: '8px', color: 'rgb(112, 112, 112)' }}>{item.botDeptNm}</TableCell>
                                        <TableCell align="center" sx={{ textAlign: 'center', width: '10%', padding: '8px', color: 'rgb(112, 112, 112)' }}>
                                            <IconButton onClick={() => handleOpenQRModal(item.facilityId, "COMPLAINT")} color="primary">
                                                <SearchIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="center" sx={{ textAlign: 'center', width: '10%', padding: '8px', color: 'rgb(112, 112, 112)' }}>
                                            <IconButton onClick={() => handleOpenQRModal(item.facilityId, "CHECKER")} color="primary">
                                                <SearchIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {Array.from({ length: rowsPerPage - qrList.length }).map((_, index) => (
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
                <Dialog open={qrModalOpen} onClose={handleCloseQrModal} maxWidth="md" >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        {selectedQrType === 'COMPLAINT' ? (
                            <DialogTitle sx={{ fontSize: '1.4rem' }}>민원인 QR</DialogTitle>
                        ) : (
                            <DialogTitle sx={{ fontSize: '1.4rem' }}>점검자 QR</DialogTitle>
                        )}
                        <IconButton onClick={handleCloseQrModal} size="small" sx={{ margin: '10px' }} >
                            <CloseIcon />
                        </IconButton></Box>
                    <DialogContent>
                        <Box sx={{
                            width: '100%',
                            padding: '0 30px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Box
                                sx={{
                                    width: '220px',
                                    height: '220px',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ECECEC',
                                    borderRadius: '8px',
                                }}
                            >
                                {selectedQrDetailInfo.qrImageUrl ? (
                                    <img
                                        src={selectedQrDetailInfo.qrImageUrl}
                                        alt="QR 코드"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            QR 이미지 없음
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    marginTop: '10px',
                                    width: '220px', 
                                    overflowWrap: 'break-word',  
                                    wordBreak: 'break-word',  
                                    display: 'block', 
                                }}
                            >
                                {selectedQrType === 'COMPLAINT'
                                    ? selectedQrDetailInfo.complaintQrUrl
                                    : selectedQrDetailInfo.checkerQrUrl}
                            </Typography>
                            <Typography variant="h6" sx={{ marginTop: '10px' }}>
                                {selectedQrDetailInfo.facilityNm}
                            </Typography>
                        </Box>
                    </DialogContent>
                    {alert && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {alert}
                        </Alert>
                    )}
                    {selectedQrType === 'CHECKER' ? (
                        selectedQrDetailInfo.qrImageUrl ? (
                            <DialogActions sx={{ justifyContent: 'center', marginBottom: '15px' }}>
                                <Button variant="outlined" onClick={() => handleGenerateQr(selectedQrDetailInfo.facilityId, 'CHECKER')} size="medium">QR 재발행</Button>
                            </DialogActions>
                        ) : (
                            <DialogActions sx={{ justifyContent: 'center', marginBottom: '15px' }}>
                                <Button variant="contained" onClick={() => handleGenerateQr(selectedQrDetailInfo.facilityId, 'CHECKER')} size="medium">QR 발행</Button>
                            </DialogActions>
                        )
                    ) : null}
                </Dialog>
            </Box>
        </>
    );
};

export default validationAuth(QRManagement);
