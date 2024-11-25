import React, { useState, useEffect } from 'react';
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
    Modal,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as common from '../../../../commons/common';

const GuideCheckHistoryModal = ({ open, onClose, item }) => {

    const [confirmUserList, setConfirmUserList] = useState([]);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (open && item) {
            setPage(1);
            fetchData();
        }
    }, [open, item]);

    useEffect(() => {
        fetchData();
    }, [page]);


    const handleCloseAndReset = () => {
        setPage(1);
        onClose();
    };

    const fetchData = async () => {
        if (!item || !item.noticeId) {
            return;
        }

        try {
            const params = {
                page: page,
                pageSize: rowsPerPage
            }

            const response = await axios.get(`${common.getApiUrl()}/notice/notice-confirm/${item.noticeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                params
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map((item) => ({
                    userNm: item.noticeConfirmNm,
                    dateOfBirth: item.dateOfBirth,
                    confirmDt: item.createdDt
                }));
                setConfirmUserList(fetchedItems);
                setTotalElements(response.data.totalElements);
            }

        } catch (error) {
            console.error('Error fetching facility details:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 700,
                    bgcolor: 'var(--main-white-color)',
                    boxShadow: 24,
                    p: 3,
                    borderRadius: 2,
                    outline: 'none',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        안전수칙 이수 기록
                    </Typography>
                    <IconButton size="small" onClick={handleCloseAndReset}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {item?.noticeNm || ''}
                        </Typography>
                        <TableContainer
                            sx={{
                                boxShadow: 'none',
                                border: 'none',
                                '& .MuiTable-root': {
                                    borderCollapse: 'separate',
                                    borderSpacing: 0,
                                }
                            }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {['이름', '개인정보(인증)', '이수일시'].map((header, index) => (
                                            <TableCell
                                                key={index}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    // width: '',
                                                    backgroundColor: '#F2F2F2',
                                                    borderTop: '2px solid #909090',
                                                    borderBottom: '2px solid #909090',
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {confirmUserList && confirmUserList.map((user, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                '&:last-child td': {
                                                    borderBottom: '2px solid #909090',
                                                },
                                                '& td': {
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                },
                                            }}
                                        >
                                            <TableCell>{user.userNm}</TableCell>
                                            <TableCell>{user.dateOfBirth}-*******</TableCell>
                                            <TableCell>{user.confirmDt}</TableCell>
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
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};

export default GuideCheckHistoryModal;