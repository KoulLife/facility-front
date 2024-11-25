import React, { useState, useEffect } from 'react';
import validationAuth from '../../../../validationAuth';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    Pagination,
    Icon,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import axios from 'axios';
import * as common from '../../../../commons/common';
import SearchArea from '../../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../../components/managerPage/gridTable';
import RegularInspectionRegistrationModal from './regularInspection-registration';

const RegularInspection = () => {
    const [searchTitle, setSearchTitle] = useState('');
    const [modifyBoardId, setModifyBoardId] = useState('');
    const [isOpenModifyModal, setIsOpenModifyModal] = useState(false);
    const [list, setList] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    const fetchData = async () => {
        try {
            const params = {
                boardNm: searchTitle,
                pageSize: rowsPerPage,
                page: page,
            };

            const response = await axios.get(`${common.getApiUrl()}/board`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                params
            });

            if (response.data && Array.isArray(response.data.content)) {
                const fetchedItems = response.data.content.map(item => ({
                    boardId: item.boardId,
                    boardNm: item.boardNm || '',
                    createUser: item.createUser || '',
                    createDt: item.createDt.split(' ')[0],
                    boardFiles: item.boardFiles,
                }));
                setList(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    };

    const handleSearchTitleChange = (name, value) => {
        if (name === 'title') setSearchTitle(value);
    };

    const handleSearchSubmit = () => {
        setPage(1);
        setModifyBoardId('')
        fetchData({ title: searchTitle });
    };

    const handleDownloadFileClick = (id, fileUrl) => {
        if (fileUrl) {
            window.open(`${common.getNoApiBaseUrl()}${fileUrl}`, '_blank')
        } else {
            alert('파일이 없습니다.')
        }
    }

    const handleModifyClick = (boardId) => {
        setModifyBoardId(boardId)
        setIsOpenModifyModal(true);
    }

    const handleOpenRegiOrModifyModal = () => {
        setIsOpenModifyModal(true);
        setModifyBoardId('')
    }

    const handleCloseRegiOrModifyModal = () => {
        setIsOpenModifyModal(false);
        setModifyBoardId('')
        fetchData();
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchData();
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', }}>
            <Typography variant='h6'>정기검사</Typography>
            <SearchArea
                searchValues={{ title: searchTitle }}
                handleSearchChanges={(name, value) => {handleSearchTitleChange(name, value)}}
                fields={[
                    {
                        fieldnm: '제목',
                        name: 'title',
                        type: 'input',
                    }
                ]}
                onSearchClick={handleSearchSubmit}
                showRightButton='true'
                rightBtnText="작성하기"
                rightbtnbgcolor="var(--sub-darkblue-color)"
                onRightBtnClick={handleOpenRegiOrModifyModal}
            />
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>번호</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>제목</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>작성자</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>작성일</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>다운로드</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>수정</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.map((item, index) => (
                                <TableRow key={index} sx={{ height: '52px' }}>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{index + 1}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.boardNm}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.createUser}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>{item.createDt}</TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <Icon onClick={() => handleDownloadFileClick(item.boardId, item.boardFiles[0].fileUrl)} sx={{ cursor: 'pointer' }}>
                                            <FileDownload></FileDownload>
                                        </Icon>
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px' }}>
                                        <ButtonOnTable text="수정" onClick={() => handleModifyClick(item.boardId)}></ButtonOnTable>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.from({ length: rowsPerPage - list.length }).map((_, index) => (
                                <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                    <TableCell colSpan={6} sx={{ padding: '8px' }} />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <RegularInspectionRegistrationModal open={isOpenModifyModal} handleClose={handleCloseRegiOrModifyModal} id={modifyBoardId} />
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
    );
};

export default validationAuth(RegularInspection);