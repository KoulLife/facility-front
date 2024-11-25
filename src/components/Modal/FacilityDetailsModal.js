import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as common from '../../commons/common';
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
    Modal,
    Grid,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FacilityDetailsModal= ({ open, onClose, facilityId }) => {
    const [facilityData, setFacilityData] = useState({});
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [deptPath, setDeptPath] = useState([]); //관리처 path

    useEffect(() => {
        if (open && facilityId) {
            fetchFacilityData(facilityId);
        }
    }, [open, facilityId]);

    const handleCloseAndReset = () => {
        setFacilityData({});
        setImagePreviewUrl('');
        onClose();
    };

    const fetchFacilityData = async (facilityId) => {
        if (!facilityId) {
            console.error('Invalid facilityId');
            return;
        }

        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/${facilityId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            const data = response.data;

            if (data) {
                const facilityData = {
                    facilityTypeNm : data.facilityTypeNm,
                    facilityNm : data.facilityNm,
                    topDeptNm : data.topDeptNm,
                    midDeptNm : data.midDeptNm,
                    botDeptNm : data.botDeptNm,
                    checkCycleNm : data.checkCycleNm,
                    qrYn : data.qrYn === 'Y'? 'O' : 'X',
                    facilityAddItems : data.facilityAddItems, //array
                    checkItems : data.checkItems, //array
                    lastCheckTime : data.lastCheckTime ? data.lastCheckTime.replace('T', ' ') : '',
                };
                setFacilityData(facilityData);
                const pathParts = [data.topDeptNm, data.midDeptNm, data.botDeptNm].filter(Boolean);
                setDeptPath(pathParts.join(" - "));
            }

            if (data.imageFile) {
                setImagePreviewUrl(`${common.getImageBaseUrl()}${data.imageFile}`);
            } else {
                setImagePreviewUrl('');
            }
        } catch (error) {
            console.error('Error fetching facility details:', error);
        }
    };

    return (
        <div>
            <Modal open={open} onClose={onClose}>
                <Box
                     sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 1000,
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        bgcolor: 'var(--main-white-color)',
                        boxShadow: 24,
                        p: 3,
                        borderRadius: 2,
                        outline: 'none'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            시설정보
                        </Typography>
                        <IconButton onClick={handleCloseAndReset} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            시설물
                        </Typography>
                        <Box sx={{ border: '1px solid #AFAFAF', borderRadius: 1, p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex' }}>
                                <Box sx={{ width: '30%', mr: 2 }}>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '10rem',
                                            bgcolor: '#F4F4F4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #ECECEC',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {imagePreviewUrl ? (
                                            <img
                                                src={imagePreviewUrl}
                                                alt="시설물"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                이미지 없음
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ width: '70%' }}>
                                    <Box
                                        sx={{
                                            border: '1px solid #E7E7E7',
                                            borderRadius: 1,
                                            p: 1,
                                            mb: 2,
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            bgcolor: '#F3F3F3',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'var(--sub-darkblue-color)',
                                            }}
                                        >
                                            {facilityData.facilityNm}
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            {[
                                                ['시설유형', facilityData.facilityTypeNm],
                                                ['최근 점검일자', facilityData.lastCheckTime],
                                                ['관리처', deptPath],
                                            ].map(([label, value], index) => (
                                                <Box key={index}
                                                    sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                                    <Typography variant="body2"
                                                        sx={{ width: '100px', position: 'relative' }}>
                                                        {label}
                                                        <span style={{ position: 'absolute', right: 0 }}>:</span>
                                                    </Typography>
                                                    <Typography variant="body2"
                                                        sx={{ ml: 1, fontWeight: 'bold' }}>
                                                        {value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Grid>
                                        <Grid item xs={6}>
                                            {[
                                                ['점검주기', facilityData.checkCycleNm],
                                                ['QR점검', facilityData.qrYn],
                                            ].map(([label, value], index) => (
                                                <Box key={index}
                                                    sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                                    <Typography variant="body2"
                                                        sx={{ width: '100px', position: 'relative' }}>
                                                        {label}
                                                        <span style={{ position: 'absolute', right: 0 }}>:</span>
                                                    </Typography>
                                                    <Typography variant="body2"
                                                        sx={{ ml: 1, fontWeight: 'bold' }}>
                                                        {value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            점검항목
                        </Typography>
                        <TableContainer
                            component={Paper}
                            sx={{
                                boxShadow: 'none',
                                border: 'none',
                                '& .MuiTable-root': {
                                    borderCollapse: 'separate',
                                    borderSpacing: 0,
                                },
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {['점검유형', '점검질문'].map((header, index) => (
                                            <TableCell
                                                key={index}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    width: '33.33%',
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
                                    {facilityData.checkItems &&
                                        facilityData.checkItems.map((item, index) => {
                                            const isSameAsPrevious = index > 0 && item.checkTypeNm === facilityData.checkItems[index - 1].checkTypeNm;
                                            const isSameAsNext = index < facilityData.checkItems.length - 1 && item.checkTypeNm === facilityData.checkItems[index + 1].checkTypeNm;
                                            return (
                                                <TableRow
                                                    key={index}
                                                    sx={{
                                                        '& td': {
                                                            borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                                            borderRight: 'none',
                                                            padding: '10px',
                                                        },
                                                    }}
                                                >
                                                    {!isSameAsPrevious ? (
                                                        <TableCell rowSpan={isSameAsNext ? facilityData.checkItems.filter((_, i) => facilityData.checkItems[i].checkTypeNm === item.checkTypeNm).length : 1} sx={{ width: '30%', textAlign: 'center' }}>
                                                            {item.checkTypeNm}
                                                        </TableCell>
                                                    ) : null}
                                                    <TableCell sx={{ width: '70%', textAlign: 'center' }} >{item.checkItemNm}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default FacilityDetailsModal;