import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import {
    Container, Typography, Select, MenuItem, FormControl, TextField,
    Button, Grid, Box, Paper, IconButton
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import * as common from '../../commons/common';
import { useParams, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

const ImprovementRegistration = () => {
    const [beforeSelect, setBeforeSelect] = useState('');
    const [beforeRemark, setBeforeRemark] = useState('');
    const [facility, setFacility] = useState(null);
    const { id: facilityId } = useParams();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const navigate = useNavigate();
    const [isCompressing, setIsCompressing] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

    useEffect(() => {
        const fetchFacility = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.get(`${common.getApiUrl()}/checker/${facilityId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setFacility(response.data);
            } catch (error) {
                common.handleApiError(error);
            }
        };

        if (facilityId) {
            fetchFacility();
        }
    }, [facilityId]);

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setIsCompressing(true);
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            };

            try {
                const compressedFiles = await Promise.all(
                    files.map(file => imageCompression(file, options))
                );

                setImageFiles(prevFiles => [...prevFiles, ...compressedFiles]);

                const newPreviewUrls = await Promise.all(
                    compressedFiles.map(file => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(file);
                        });
                    })
                );

                setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
            } catch (error) {
                common.handleApiError(error);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        const insertIssueRequest = {
            facilityId: Number(facilityId),
            issueContent: beforeRemark,
            checkTypeId: beforeSelect ? Number(beforeSelect) : null,
        };

        formData.append('insertIssueRequest', new Blob([JSON.stringify(insertIssueRequest)], { type: 'application/json' }));

        imageFiles.forEach((file, index) => {
            formData.append(`uploadFiles`, file);
        });

        try {
            const response = await axios.post(`${common.getApiUrl()}/checker/issue`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            alert('이상사항 등록되었습니다.');
            navigate('/checker/improvement-registration-list');
        } catch (error) {
            common.handleApiError(error);
        }
    };


    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}년 ${month}월 ${day}일`;
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
                backgroundColor: 'var(--main-blue-color)',
                height: '170px',
                position: 'relative'
            }}>
                <Box sx={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '15px', padding: '0 10px 0 4px' }}
                    onClick={() => navigate(-1)}>
                    <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>이전</Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    color: '#fff',
                    paddingTop: '10px'
                }}>
                    <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
                        {facility?.facilityNm}
                    </Typography>
                </Box>
            </Box>
            <Container maxWidth="lg" sx={{
                padding: '0',
                flexGrow: 1,
                paddingBottom: '80px'
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 17px',
                    color: '#696969',
                    marginTop: '10px',
                }}>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                        작성일시 : <span style={{ fontWeight: 'bold' }}>{formatDate(new Date())}</span>
                    </Typography>
                </Box>
                <Paper sx={{ p: 2, mb: 2, mt: 1, boxShadow: 'none', borderRadius:'15px'}}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '10px',
                                        backgroundColor: '#fff',
                                        minHeight: 140,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: '10px',
                                    }}
                                    onClick={() => document.getElementById('before-image-upload').click()}
                                >
                                    {imagePreviewUrls.length === 0 && !isCompressing &&
                                        <FileUploadOutlinedIcon sx={{ color: 'var(--main-blue-color)', fontSize: '3.5rem' }} />
                                    }
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                        gap: '10px',
                                    }}>
                                        {imagePreviewUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        ))}
                                    </Box>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none', backgroundColor: "#fff" }}
                                        id="before-image-upload"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    {imagePreviewUrls.length === 0 && !isCompressing && (
                                        <Typography
                                            variant="body2"
                                            component="span"
                                            sx={{
                                                color: '#A4A4A4',
                                                fontSize: '0.7rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            이미지를 업로드하시려면<br />여기를 클릭하세요
                                        </Typography>
                                    )}
                                    {isCompressing && (
                                        <Typography
                                            variant="body2"
                                            component="span"
                                            sx={{
                                                color: '#21509E',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                textAlign: 'center'
                                            }}
                                        >
                                            이미지 압축 중...
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined" sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderRadius: '10px',
                                            borderColor: '#e0e0e0'
                                        },
                                    },
                                }}>
                                    <Typography sx={{ fontSize: '1.1rem', fontWeight:'bold', mb:1 }}>점검유형</Typography>
                                    <Select
                                        value={beforeSelect}
                                        onChange={(event) => setBeforeSelect(event.target.value)}
                                        IconComponent={(props) => (
                                            beforeSelect ? <ExpandLessIcon {...props} /> : <ExpandMoreIcon {...props} />
                                        )}
                                    >
                                        {[...new Set(facility?.checkItems?.map((item) => item.checkTypeNm))].map((type, index) => (
                                            <MenuItem key={index}
                                                value={facility.checkItems.find(item => item.checkTypeNm === type).checkTypeId}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight:'bold', mb:1 }}>상세 입력</Typography>
                                <TextField
                                    multiline
                                    rows={4}
                                    value={beforeRemark}
                                    autoComplete="off"
                                    onChange={(event) => setBeforeRemark(event.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                            borderRadius: '10px',
                                            borderColor: '#e0e0e0'
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
            {facility && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: 'white',
                        py: 2,
                        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        left: 0,
                        px: '20px',
                        boxSizing: 'border-box',
                        zIndex: 1300,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{
                            maxWidth: '600px',
                            fontSize: '1.3rem',
                            boxShadow: 'none',
                            backgroundColor: 'var(--main-blue-color)',
                        }}
                        onClick={handleSubmit}
                    >
                        등록
                    </Button>
                </Box>
            )}
        </Box>
    );
}
export default validationAuth(ImprovementRegistration);