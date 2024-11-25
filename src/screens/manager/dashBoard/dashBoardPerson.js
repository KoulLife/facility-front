import React, { useState } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box,
    Typography,
    Button,
    Divider,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const DashBoardPerson = () => {
    const [selectedButton, setSelectedButton] = useState('당일');
    const [searchQuery, setSearchQuery] = useState('');
    const [personalSearchQuery, setPersonalSearchQuery] = useState('');

    const handleButtonClick = (button) => {
        setSelectedButton(button);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePersonalSearchChange = (event) => {
        setPersonalSearchQuery(event.target.value);
    };

    // 대시보드 개인별 데이터 (임시)
    const data = [
        { name: '홍길동1', days: 25, time: 8, quantity: 10, total: 80 },
        { name: '홍길동2', days: 25, time: 8, quantity: 10, total: 80 },
        { name: '홍길동3', days: 25, time: 8, quantity: 10, total: 80 },
        { name: '홍길동4', days: 25, time: 8, quantity: 10, total: 80 },
        { name: '홍길동5', days: 25, time: 8, quantity: 10, total: 80 },
    ];

    const tableStyles = {
        minWidth: 650,
        '& .MuiTableCell-root': {
            borderBottom: '1px solid #e0e0e0',
            padding: '16px 8px',
        },
        '& .MuiTableRow-root:last-child .MuiTableCell-root': {
            borderBottom: 'none',
        }
    };

    const headerStyles = {
        backgroundColor: '#f5f5f5',
        '& .MuiTableCell-root': {
            fontWeight: 'bold',
            color: '#333',
        }
    };

    const paginationStyles = {
        '& .MuiPaginationItem-root': {
            color: '#1E88E5',
            borderColor: '#1E88E5',
        },
        '& .Mui-selected': {
            backgroundColor: '#1E88E5',
            color: 'white',
        },
    };

    return (
        <Box>
            <Box sx={{ width: '100%' }}>
                <Box sx={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant='h6'>점검자 통계</Typography>
                    <Button variant="contained"
                        sx={{
                            backgroundColor: 'var(--main-blue-color)',
                            boxShadow: 'none',
                            width: '130px',
                            marginRight: '16px',
                            color: '#fff',
                            '&:hover': { backgroundColor: 'var(--main-blue-color)', boxShadow: 'none' },
                        }}>
                        자료 다운로드
                    </Button>
                </Box>
            </Box>
            <Box sx={{ backgroundColor: '#fff', marginTop: 2, padding: 2, borderRadius: '10px' }}>
                {/* 전체 분석 섹션 */}
                <Box display="flex" flexDirection='column' mb={5}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold', mr: 2, }}>
                            전체 분석
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="검색"
                                value={searchQuery}
                                autoComplete="off"
                                onChange={handleSearchChange}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    input: { color: 'black' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#1E88E5' },
                                        '&:hover fieldset': { borderColor: '#486EAF' },
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => console.log('Search:', searchQuery)}>
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650, '& .MuiTableCell-root': { borderBottom: '1px solid #e0e0e0' } }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell>이름</TableCell>
                                    <TableCell>근무일</TableCell>
                                    <TableCell>시간</TableCell>
                                    <TableCell>수량</TableCell>
                                    <TableCell>계</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.days}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: '70%', mr: 1 }}>
                                                    <Box sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#1E88E5',
                                                        width: `${row.time / 10 * 100}%`
                                                    }} />
                                                </Box>
                                                {row.time}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: '70%', mr: 1 }}>
                                                    <Box sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#FFA726',
                                                        width: `${row.quantity / 10 * 100}%`
                                                    }} />
                                                </Box>
                                                {row.quantity}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                        <Pagination
                            count={5}
                            variant="outlined"
                            shape="rounded"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: '#1E88E5',
                                    borderColor: '#1E88E5',
                                },
                                '& .Mui-selected': {
                                    backgroundColor: '#1E88E5',
                                    color: 'white',
                                },
                            }}
                        />
                    </Box>
                </Box>
                {/* 개인별 분석 섹션 */}
                <Box display="flex" flexDirection='column' mb={2}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography
                            sx={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                mr: 2,
                            }}>
                            개인별 분석
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="이름"
                                value={personalSearchQuery}
                                onChange={handlePersonalSearchChange}
                                autoComplete="off"
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    input: { color: 'black' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#1E88E5' },
                                        '&:hover fieldset': { borderColor: '#486EAF' },
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => console.log('Personal Search:', personalSearchQuery)}>
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table sx={tableStyles}>
                            <TableHead>
                                <TableRow sx={headerStyles}>
                                    <TableCell>이름</TableCell>
                                    <TableCell>근무일</TableCell>
                                    <TableCell>시간</TableCell>
                                    <TableCell>수량</TableCell>
                                    <TableCell>계</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.days}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: '70%', mr: 1 }}>
                                                    <Box sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#1E88E5',
                                                        width: `${row.time / 10 * 100}%`
                                                    }} />
                                                </Box>
                                                {row.time}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: '70%', mr: 1 }}>
                                                    <Box sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#FFA726',
                                                        width: `${row.quantity / 10 * 100}%`
                                                    }} />
                                                </Box>
                                                {row.quantity}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                        <Pagination count={5} variant="outlined" shape="rounded" sx={paginationStyles} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default validationAuth(DashBoardPerson);
