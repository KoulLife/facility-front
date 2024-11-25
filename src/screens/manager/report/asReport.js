import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Pagination, Icon, } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import axios from 'axios';
import * as common from '../../../commons/common';
import SearchArea from '../../../components/managerPage/searchArea';
import {CircularProgress} from '@mui/material';

const AsReport = () => {

    const [searchFacilityNm, setSearchFacilityNm] = useState('');
    const [list, setList] = useState([]);
    const [downloadingId, setDownloadingId] = useState(null); // 다운로드 중인 아이템 ID 저장
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    // 고장A/S 리스트 가져오기
    const fetchData = async () => {
        const url = `${common.getApiUrl()}/issue`;
        const token = localStorage.getItem('access_token');

        try {
            const params = {
                facilityNm: searchFacilityNm || '',
                pageSize: rowsPerPage,
                page: page
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map(item => ({
                    issuesId: item.issuesId,
                    facilityNm: item.facilityNm || '',
                    botDeptNm: item.botDeptNm || '',
                    checkTime: item.checkTime || '',
                    lastStateNm: item.lastStateNm || ''
                }));
                setList(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    };

    const handleSearchParamChange = (name, value) => {
        if (name === 'facilityNm') {
            setSearchFacilityNm(value);
        }
    };

    const handleDownloadClick = async (issueId) => {
        setDownloadingId(issueId); 
        try {
            await pdfDownload(issueId);
        } catch (error) {
            console.error("파일 다운로드 중 오류 발생:", error);
        } finally {
            setDownloadingId(null);  
        }
    };

    const pdfDownload = async (issueId) => {
        const url = `${common.getApiUrl()}/download/pdf/issueReport`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(`${url}/${issueId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'blob'
            });

            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                let filename = 'issue.pdf';

                if (contentDisposition && contentDisposition.includes('attachment')) {
                    const filenameRegex = /filename\*=UTF-8''(.+)$/;  // UTF-8 인코딩된 filename 추출

                    // contentDisposition => attachement; filename=파일명
                    let matches = contentDisposition.split(';').filter(str => str.includes('filename'));

                    if (!matches) {
                        // 위 정규식으로 찾지 못하면 일반 filename으로 시도
                        matches = /filename="?([^;\n"]+)"?/.exec(contentDisposition);
                    }
                    if (matches != null && matches[0]) {
                        //matches => filename=파일명
                        [, filename] = matches[0].split('=');
                        filename = decodeURIComponent(filename);
                    }
                }

                const blob = new Blob([response.data], { type: 'application/pdf' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;  // 디코딩된 파일 이름으로 다운로드
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);  // 메모리 해제
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    }

    const handleSearchSubmit = () => {
        setPage(1);
        fetchData();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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
                    searchValues={{ facilityNm: searchFacilityNm }}
                    handleSearchChanges={(name, value) => { handleSearchParamChange(name, value); }}
                    fields={[
                        {
                            fieldnm: '시설명',
                            name: 'facilityNm',
                            type: 'input',
                        }
                    ]}
                    onSearchClick={handleSearchSubmit}
                />
                <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>시설명</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>팀</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>등록일시</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>진행상태</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>PDF 다운로드</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {list.map((item, index) => (
                                    <TableRow key={index} sx={{ height: '52px' }}>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.facilityNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.botDeptNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.checkTime}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{item.lastStateNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>
                                            {downloadingId === item.issueId ? (
                                                <CircularProgress size={24} /> //로딩
                                            ) : (
                                            <Icon onClick={() => handleDownloadClick(item.issuesId)} sx={{ cursor: 'pointer' }}>
                                                <FileDownload />
                                            </Icon>
                                        )}
                                        </TableCell>
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

export default AsReport;