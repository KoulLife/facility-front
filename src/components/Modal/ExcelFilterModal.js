import React, { useState } from 'react';
import axios from 'axios';
import * as common from '../../commons/common';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box } from '@mui/material';
import SearchArea from '../managerPage/searchArea';

const ExcelFilterModal = ({ open, onClose, excelType, searchParams }) => {
    const today = new Date().toISOString().substring(0, 10);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [excelDownloading, setExcelDownloading] = useState(false);

    const handleStartDateChange = (name, value) => {
        if (name === 'startDate') {
            setStartDate(value);
        }
    };

    const handleEndDateChange = (name, value) => {
        if (name === 'endDate') {
            setEndDate(value);
        }
    };

    const clickExcelDownload = async () => {
        setExcelDownloading(true);
        try {
            await handleExcelDownload();
        } catch (error) {
            console.error("파일 다운로드 중 오류 발생:", error);
        } finally {
            setExcelDownloading(false);
        }
    };

    const handleExcelDownload = async () => {
        const url = `${common.getApiUrl()}/excel/${excelType}`;
        const params = {
            startDt: startDate,
            endDt: endDate,
            ...searchParams
        };
        try {
            const response = await axios.post(url, params, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'blob'
            });
            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                let filename = `${excelType}.xlsx`;

                if (contentDisposition && contentDisposition.includes('attachment')) {

                    let matches = contentDisposition.split(';').filter(str => str.includes('filename'));

                    if (!matches) {
                        matches = /filename="?([^;\n"]+)"?/.exec(contentDisposition);
                    }
                    if (matches != null && matches[0]) {
                        [, filename] = matches[0].split('=');
                        filename = decodeURIComponent(filename);
                    }
                }
                const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);  // 메모리 해제
                document.body.removeChild(a);
            }
        } catch (error) {
            alert('다운로드에 실패하였습니다.');
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>엑셀 데이터 기간 설정</DialogTitle>
            <DialogContent>
                <SearchArea
                    searchValues={{ startDate: startDate, endDate: endDate }}
                    handleSearchChanges={(name, value) => {
                        if (name === 'startDate') {
                            handleStartDateChange(name, value);
                        } else if (name === 'endDate') {
                            handleEndDateChange(name, value);
                        }
                    }}
                    fields={[
                        {
                            fieldnm: '',
                            name: 'startDate',
                            type: 'calendar',
                        },
                        {
                            fieldnm: '~',
                            name: 'endDate',
                            type: 'calendar',
                        }
                    ]}
                    notSearch
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button variant="contained" onClick={clickExcelDownload} disabled={excelDownloading} sx={{position:'relative'}}>
                    다운로드
                    {excelDownloading ? (
                    <Box sx={{ position: 'absolute', top: '6px' }}>
                        <CircularProgress size={24}  />
                    </Box>) : (null)}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ExcelFilterModal;