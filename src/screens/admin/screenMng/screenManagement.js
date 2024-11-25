import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import axios from 'axios';
import * as common from '../../../commons/common';

const ScreenManagement = () => {
    const [categories, setCategories] = useState([]);
    const [editItem, setEditItem] = useState({});
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newComDtlVal, setNewComDtlVal] = useState('');
    const [editCategoryComMstrId, setEditCategoryComMstrId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            const url = `${common.getApiUrl()}/admin/com-mstr`;
            const token = localStorage.getItem('access_token');

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data) {
                    //점검상태 CM2, 민원항목관리 CM4은 시설관리 페이지에서 관리하는걸로 변경
                    const categoriesFilter = response.data.filter(ctgr => ctgr.comMstrId !== 'CM2' && ctgr.comMstrId !== 'CM4')
                    setCategories(categoriesFilter);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleAddItem = (category) => {
        setNewComDtlVal(String(category.comCdDtls.length)); //comDtlVal 보내야하니까 일단 length로 추가값 해놓기
        setEditItem({ comDtlNm: '', comDtlVal: '', comMstrId: category.comMstrId });
        setEditCategoryComMstrId(category.comMstrId);
        setEditDialogOpen(true);
    };

    const handleRemoveItem = async (id, category) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const token = localStorage.getItem('access_token');
            try {
                await axios.delete(`${common.getApiUrl()}/admin/com-dtl/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setCategories(categories.map(cat => cat.comMstrId === category
                    ? { ...cat, comCdDtls: cat.comCdDtls.filter(item => item.comDtlId !== id) }
                    : cat
                ));
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleEditItem = (item, category) => {
        setEditItem(item);
        setEditCategoryComMstrId(category);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditItem(null);
        setError('');
    };

    const handleEditDialogSave = async () => {
        const token = localStorage.getItem('access_token');

        try {
            if (editItem.comDtlId) {
                await axios.put(`${common.getApiUrl()}/admin/com-dtl/${editItem.comDtlId}`, editItem, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // 추가이면
                const addEditItem = { ...editItem, comMstrId: String(editCategoryComMstrId), comDtlVal: String(newComDtlVal) }

                if (addEditItem)
                    await axios.post(`${common.getApiUrl()}/admin/com-dtl`, addEditItem, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
            }

            // Refresh the category data
            const url = `${common.getApiUrl()}/admin/com-mstr`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error saving item:', error);
        }
        handleEditDialogClose();
    };

    const handleEditChange = (field, value) => {
        setEditItem({ ...editItem, [field]: value });
    };

    const commonCellStyle = {
        padding: '8px 16px',
        textAlign: 'left',
        fontWeight: 'bold',
        borderRight: '1px solid #ddd'
    };

    const commonHeadCellStyle = {
        borderBottom: '2px solid #ddd',
        borderRight: '1px solid #ddd'
    };

    const commonBodyCellStyle = {
        borderBottom: '1px solid #ddd',
        borderRight: '1px solid #ddd'
    };

    const tableContainerStyle = {
        marginBottom: '20px'
    };

    const tableStyle = {
        borderCollapse: 'collapse'
    };

    const fixedCellWidths = {
        firstCell: '100px',
        secondCell: '150px',
        thirdCell: '150px',
        fourthCell: '100px'
    };

    const buttonStyle = {
        minWidth: '80px',
        margin: '0 4px'
    };

    const renderTable = (category) => (
        <Box sx={tableContainerStyle} key={category.comMstrId}>
            <Typography variant="h7" sx={{ fontWeight: 'bold' }}>{category.comMstrNm}</Typography>
            <TableContainer component={Paper} sx={{ marginTop: '10px', marginBottom: '50px' }}>
                <Table sx={tableStyle}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{
                                ...commonCellStyle, ...commonHeadCellStyle,
                                width: fixedCellWidths.firstCell
                            }}></TableCell>
                            {category.comMstrId == "CM5" ? (
                                <TableCell style={{
                                    ...commonCellStyle, ...commonHeadCellStyle,
                                    width: fixedCellWidths.secondCell
                                }}>구분 (m)</TableCell>
                            ) : (<TableCell style={{
                                ...commonCellStyle, ...commonHeadCellStyle,
                                width: fixedCellWidths.secondCell
                            }}>구분</TableCell>)}
                            {category.comMstrId !== "CM5" && (
                                <TableCell
                                    style={{
                                        ...commonCellStyle, ...commonHeadCellStyle,
                                        width: fixedCellWidths.fourthCell
                                    }}>
                                    <Button variant="contained" color="primary"
                                        onClick={() => handleAddItem(category)} sx={buttonStyle}>
                                        추가
                                    </Button>
                                </TableCell>
                            )}
                            {category.comMstrId === "CM5" && (
                                <TableCell style={{
                                    ...commonCellStyle, ...commonHeadCellStyle,
                                    width: fixedCellWidths.fourthCell
                                }} />
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ backgroundColor: '#f5f5f5' }}>
                        {category.comCdDtls && category.comCdDtls.map((item) => (
                            <TableRow key={item.comDtlId}>
                                <TableCell style={{
                                    ...commonCellStyle, ...commonBodyCellStyle,
                                    width: fixedCellWidths.firstCell
                                }}>{category.comMstrNm}</TableCell>
                                <TableCell style={{
                                    ...commonCellStyle, ...commonBodyCellStyle,
                                    width: fixedCellWidths.secondCell
                                }}>{item.comDtlNm}</TableCell>
                                <TableCell style={{
                                    ...commonCellStyle, ...commonBodyCellStyle,
                                    width: fixedCellWidths.fourthCell
                                }}>
                                    <Button variant="outlined" color="primary"
                                        onClick={() => handleEditItem(item, category.comMstrId)}
                                        sx={buttonStyle}>
                                        수정
                                    </Button>
                                    {category.comMstrId !== "CM5" && item.comDtlVal !== "0" && (
                                        <Button variant="outlined"
                                            color="error"
                                            sx={{ ...buttonStyle }}
                                            onClick={() => handleRemoveItem(item.comDtlId, category.comMstrId)}>
                                            삭제
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>화면 설정</Typography>
            <Box sx={{ marginTop: '30px' }}>
                {categories.map(renderTable)}
            </Box>
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                <DialogTitle>{editItem?.comDtlId ? '항목 수정' : '항목 추가'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="구분"
                        fullWidth
                        autoComplete="off"
                        value={editItem?.comDtlNm || ''}
                        onChange={(e) => handleEditChange('comDtlNm', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} sx={{ color: 'red' }}>취소</Button>
                    <Button onClick={handleEditDialogSave} color="primary">저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default validationAuth(ScreenManagement);