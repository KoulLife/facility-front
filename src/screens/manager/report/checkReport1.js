import React, { useState, useEffect } from 'react';
import {
    Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, Paper, Pagination, Icon,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import axios from 'axios';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../components/managerPage/gridTable';

const CheckReport1 = () => {
    const today = new Date().toISOString().substring(0, 10);
    const [facilityTypes, setFacilityTypes] = useState([]);
    const [list, setList] = useState([]);

    const [searchParams, setSearchParams] = useState({
        facilityType: '',
        facilityNm: '',
        startDt: today,
        endDt: today,
        pageSize: '',
        pageNumber: '',
    });

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(()=>{
        getFacilityType()
    },[])

    // 시설유형 리스트
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
                fetchedItems.unshift({ value: ' ', label: '선택' });
                setFacilityTypes(fetchedItems);
            }
        } catch (error) {
            console.error('데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    const handleSearchParamChange = (name, value) => {
        setSearchParams({
            ...searchParams,
            [name]: value
        });
    };

    const handleSearchSubmit = () => {
        setPage(1);
        // fetchData({ title: searchTitle });
    };

    const handleHistoryClick = (event, item) => {
        alert('파일이 없습니다.')
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        // fetchData();
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };
    return (
        <>
            <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                <SearchArea
                    searchValues={{ facilityType: searchParams.facilityType, facilityNm: searchParams.facilityNm, startDt: searchParams.startDt, endDt: searchParams.endDt }}
                    handleSearchChanges={(name, value) => { handleSearchParamChange(name, value); }}
                    fields={[
                        {
                            fieldnm: '시설유형',
                            name: 'facilityType',
                            type: 'select',
                            options: facilityTypes
                        },
                        {
                            fieldnm: '점검일',
                            name: 'startDt',
                            type: 'calendar',
                        },
                        {
                            fieldnm: '~',
                            name: 'endDt',
                            type: 'calendar',
                        }
                    ]}
                    onSearchClick={handleSearchSubmit}
                />
                <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설유형</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설명</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>점검자</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>점검일</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {list.map((item, index) => (
                                    <TableRow key={index} sx={{ height: '52px' }}>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.title}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.num}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.category}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.date}</TableCell>
                                        {/* <TableCell align="center" sx={{ padding: '4px' }}>
                                            {item.category === '기타' ? (
                                                <ButtonOnTable text="조회" onClick={(event) => handleHistoryClick(event, item)}></ButtonOnTable>
                                            ) :
                                                (
                                                    <Icon onClick={(event) => handleHistoryClick(event, item)} sx={{ cursor: 'pointer' }}>
                                                        <FileDownload></FileDownload>
                                                    </Icon>
                                                )}
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                                {Array.from({ length: rowsPerPage - list.length }).map((_, index) => (
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
                                onPageChange={() => null}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    )
}

export default CheckReport1;