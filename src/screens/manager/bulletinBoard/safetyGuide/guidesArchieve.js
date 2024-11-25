import React, { useState, useEffect } from 'react';
import validationAuth from '../../../../validationAuth';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, Paper, Pagination, Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as common from '../../../../commons/common';
import { useNavigate } from 'react-router-dom';
import SearchArea from '../../../../components/managerPage/searchArea';
import ButtonOnTable from '../../../../components/managerPage/gridTable';
import GuideCheckHistoryModal from './guideCheckHistory';
import GuideRegistrationModal from './guide-registration';

const GuidesArchive = () => {
    const navigate = useNavigate();
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedRule, setSelectedRule] = useState(null);
    const [isOpenRuleRegistrationModal, setIsOpenRuleRegistrationModal] = useState(false);
    const [isOpenRuleModifyModal, setIsOpenRuleModifyModal] = useState(false);
    const [isOpenCheckHistoryModal, setIsOpenCheckHistoryModal] = useState(false);
    const [issOpenQrModal, setIsOpenQrModal] = useState(false);
    const [rules, setRules] = useState([]);
    const [modifyNoticeId, setModifyNoticeId] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedQrDetailInfo, setSelectedQrDetailInfo] = useState({}); //qr 조회 선택 detail info

    useEffect(() => {
        fetchRulesData();
    }, [page, rowsPerPage]);

    // 안전수칙 리스트 가져오기
    const fetchRulesData = async () => {
        try {
            const params = {
                noticeNm: searchTitle,
                pageSize: rowsPerPage,
                page: page,
            };

            const response = await axios.get(`${common.getApiUrl()}/notice`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                params
            });

            if (response.status === 200) {
                const fetchedItems = response.data.content.map((item) => ({
                    noticeId: item.noticeId,
                    noticeNm: item.noticeNm || '',
                    qrImageUrl: item.qrImagePath,
                    createdDt: item.createdDt.split(' ')[0],
                }));
                setRules(fetchedItems);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error('리스트 불러오기에 실패했습니다:', error);
            alert('리스트 불러오기에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        }
    };

    const handleSearchTitleChange = (name, value) => {
        if (name === 'title') { setSearchTitle(value); }
    };

    const handleSearchSubmit = () => {
        setPage(1);
        setModifyNoticeId('')
        fetchRulesData({ title: searchTitle });
    };

    const handleHistoryClick = (event, rule) => {
        setSelectedRule(rule);
        setIsOpenCheckHistoryModal(true);
    }

    const handleOpen = () => setIsOpenCheckHistoryModal(true);
    const handleClose = () => setIsOpenCheckHistoryModal(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchRulesData();
    };
    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    const handleOpenRegistrationModal = () => {
        setIsOpenRuleRegistrationModal(true);
        setModifyNoticeId('')
    }
    const handleCloseRegistrationModal = () => {
        setIsOpenRuleRegistrationModal(false);
        fetchRulesData();
    }

    const handleModifyClick = (noticeId) => {
        setModifyNoticeId(noticeId)
        setIsOpenRuleModifyModal(true);
    }

    const handleCloseModifyModal = () => {
        setModifyNoticeId('')
        setIsOpenRuleModifyModal(false);
        fetchRulesData();
    }

    const handleOpenQRModal = async (noticeId) => {
        const noticeInfo = rules.find(item => item.noticeId === noticeId)
        console.log(noticeInfo)

        if (noticeInfo) {
            setSelectedQrDetailInfo(prevState => ({
                ...prevState,
                noticeId: noticeInfo.noticeId,
                noticeNm: noticeInfo.noticeNm,
                qrImageUrl: noticeInfo.qrImageUrl,
            }));
        } else {
            alert('Error : 해당 안전수칙 게시물의 QR을 불러올 수 없습니다.')
        }
        setQrModalOpen(true);
    };

    const handleCloseQrModal = () => {
        setQrModalOpen(false);
    }

    return (
        <>
            <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>안전수칙</Typography>
                <SearchArea
                    searchValues={{ title: searchTitle }}
                    handleSearchChanges={(name, value) => { handleSearchTitleChange(name, value); }}
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
                    onRightBtnClick={handleOpenRegistrationModal}
                />
                <GuideRegistrationModal open={isOpenRuleRegistrationModal} handleClose={handleCloseRegistrationModal} />
                <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '10px', padding: '15px 10px' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#F2F2F2' }}>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>번호</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>제목</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>작성일</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>QR</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>이수 기록</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>수정</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rules.sort((a, b) => a.noticeId - b.noticeId).map((rule, index) => (
                                    <TableRow key={index} sx={{ height: '52px' }}>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{rule.noticeNm}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>{rule.createdDt}</TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>
                                            <ButtonOnTable text="조회" onClick={() => handleOpenQRModal(rule.noticeId)}></ButtonOnTable>
                                        </TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>
                                            <ButtonOnTable text="조회" onClick={(event) => handleHistoryClick(event, rule)}></ButtonOnTable>
                                        </TableCell>
                                        <TableCell align="center" sx={{ padding: '4px' }}>
                                            <ButtonOnTable text="수정" onClick={() => handleModifyClick(rule.noticeId)}></ButtonOnTable>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {Array.from({ length: rowsPerPage - rules.length }).map((_, index) => (
                                    <TableRow key={`empty-row-${index}`} sx={{ height: '54px' }}>
                                        <TableCell colSpan={6} sx={{ padding: '8px' }} />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <GuideRegistrationModal open={isOpenRuleModifyModal} handleClose={handleCloseModifyModal} ruleId={modifyNoticeId} />
                    <GuideCheckHistoryModal open={isOpenCheckHistoryModal} onClose={handleClose} item={selectedRule} />
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
            <Dialog open={qrModalOpen} onClose={handleCloseQrModal} maxWidth="md" >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <DialogTitle sx={{ fontSize: '1.4rem' }}>안전수칙 QR</DialogTitle>
                    <IconButton onClick={handleCloseQrModal} size="small" sx={{ margin: '10px' }} >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent>
                    <Box sx={{
                        width: '100%',
                        padding: '0 30px 30px 30px',
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
                                    src={`${common.getImageBaseUrl()}${selectedQrDetailInfo.qrImageUrl}`}
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
                                        QR 불러오기 실패
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize:'0.8rem',
                                marginTop: '10px',
                                width: '220px',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                display: 'block',
                            }}
                        >
                            {`${common.getNoApiBaseUrl()}/safetyIntro/${selectedQrDetailInfo.noticeId}`}
                        </Typography>
                        <Typography variant="h6" sx={{ marginTop: '10px' }}>
                            {selectedQrDetailInfo.noticeNm}
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default validationAuth(GuidesArchive);