import React, {useState, useEffect} from 'react';
import validationAuth from '../../validationAuth';
import {Box, Typography, IconButton, Button, Paper, TextField} from '@mui/material';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import imageEmpty from '../../images/image_empty.png';
import imageUpload from '../../images/image_upload.png';
import axios from 'axios';
import * as common from '../../commons/common';
import imageCompression from 'browser-image-compression';

//점검자 - 고장 A/S 등록화면
const ImprovementInfoRegistration = () => {
    const {id} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const {facilityName, facilityType} = location.state || {};
    const [issue, setIssue] = useState({});
    const [resolve, setResolve] = useState(null);
    const [improvementContent, setImprovementContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);


    useEffect(() => {
        fetchIssue();
        fetchResolve();
    }, [id]);

    useEffect(() => {
        setIsButtonEnabled(improvementContent.trim() !== '');
    }, [improvementContent]);

    const fetchIssue = async () => {
        if (!id) return;

        const url = `${common.getApiUrl()}/checker/issue/${id}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setIssue(response.data);
            } else {
                console.error('Failed to fetch issue:', response);
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

    const fetchResolve = async () => {
        if (!id) return;

        const url = `${common.getApiUrl()}/checker/resolve/${id}`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setResolve(response.data);
                setImprovementContent(response.data.resolveContent || '');
                if (response.data.resolveImgSrc && response.data.resolveImgSrc.length > 0) {
                    setImagePreviewUrl(common.getImageBaseUrl() + response.data.resolveImgSrc[0]);
                }
            } else {
                console.error('Failed to fetch resolve:', response);
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

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

    const handleImprovementSubmit = async () => {
        const token = localStorage.getItem('access_token');
        let url, method, formData;

        formData = new FormData();

        if (resolve) {
            // 수정 로직
            url = `${common.getApiUrl()}/checker/resolve/${resolve.issueResolveId}`;
            method = 'put';
            const modifiedIssueResolveRequest = {
                resolveContent: improvementContent
            };
            formData.append('modifiedIssueResolveRequest', new Blob([JSON.stringify(modifiedIssueResolveRequest)], {type: 'application/json'}));
        } else {
            // 새로운 등록 로직
            url = `${common.getApiUrl()}/checker/resolve`;
            method = 'post';
            const insertIssuesResolveRequest = {
                issuesId: issue.issuesId,
                resolveContent: improvementContent,
            };
            formData.append('insertIssuesResolveRequest', new Blob([JSON.stringify(insertIssuesResolveRequest)], {type: 'application/json'}));
        }

        imageFiles.forEach((file, index) => {
            formData.append(`uploadFiles`, file);
        });


        if (imageFile) {
            formData.append('uploadFiles', imageFile);
        }

        try {
            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert(resolve ? '개선안이 수정되었습니다.' : '개선안이 등록되었습니다.');
                navigate(-1);
            } else {
                console.error('Failed to submit improvement:', response);
                alert('개선안 제출에 실패했습니다.');
            }
        } catch (error) {
            common.handleApiError(error);
            alert('개선안 제출 중 오류가 발생했습니다.');
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--main-white-color)',
        }}>
            {/* 상단헤더 */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '10px 20px',
                backgroundColor: 'var(--main-blue-color)',
                color: 'white',
                minHeight: 65,
            }}>
                <Box sx={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '15px', padding: '0 10px 0 4px' }}
                    onClick={() => navigate(-1)}>
                    <IconButton sx={{ color: 'var(--main-blue-color)', padding: 0, paddingLeft: '1px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '1.1rem', color: 'var(--main-blue-color)' }}>이전</Typography>
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '20px 20px 0px 20px',
                paddingBottom: '100px'
            }}>
                <Paper elevation={0} sx={{width: '100%', padding: '10px'}}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        border: '1px grey',
                        backgroundColor: '#EBEBEB',
                        height: 150,
                        cursor: 'pointer',
                        position: 'relative',
                        alignItems: 'center',
                    }}>
                        {issue.issueImgSrc && issue.issueImgSrc.length > 0 ? (
                            <img src={common.getImageBaseUrl() + issue.issueImgSrc[0]} alt="example"
                                 style={{
                                     maxWidth: '80%', maxHeight: '80%', objectFit: 'contain',
                                 }}/>
                        ) : (
                            <img src={imageEmpty} alt="example"
                                 style={{
                                     maxWidth: '80%', maxHeight: '80%', objectFit: 'contain',
                                 }}/>
                        )}
                    </Box>
                    <Box sx={{
                        padding: '10px',
                        border: '1px solid #E2E6EC',
                        borderRadius: '4px',
                        mt: 1,
                    }}>
                        <Typography variant="h6">
                            {issue.checkTypeNm || ''}
                        </Typography>
                        <Typography variant="body2">
                            {issue.issueContent || "작성 내용이 없습니다."}
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 1, flexDirection:'column', alignItems:'center'}}>
                        <KeyboardDoubleArrowDownIcon sx={{width: '45px', height: '45px', color: 'var(--main-softblue-color)'}}/>
                        <Typography variant="body2" >개선안을 등록해주세요.</Typography>
                    </Box>
                    <Box
                        sx={{
                            border: '1px dashed grey',
                            backgroundColor: '#EBEBEB',
                            minHeight: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            mt: 1,
                            padding: '10px'
                        }}
                        onClick={() => document.getElementById('upload-input').click()}
                    >
                        {imagePreviewUrls.length === 0 ? (
                            <>
                                <img
                                    src={imageUpload}
                                    alt="이미지 업로드"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        alignSelf: 'center',
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    component="span"
                                    sx={{
                                        color: '#A4A4A4',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        marginTop: '10px',
                                        textAlign: 'center'
                                    }}
                                >
                                    사진을 올리시려면 이곳을 클릭하세요.
                                </Typography>
                            </>
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '10px'
                            }}>
                                {imagePreviewUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                    />
                                ))}
                            </Box>
                        )}
                        <input
                            accept="image/*"
                            style={{display: 'none'}}
                            id="upload-input"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </Box>
                    {isCompressing && (
                        <Typography sx={{mt: 1, textAlign: 'center', color: '#21509E'}}>
                            이미지 압축 중...
                        </Typography>
                    )}
                    <Box sx={{
                        padding: '10px',
                        border: '1px solid #E2E6EC',
                        borderRadius: '4px',
                        mt: 2,
                    }}>
                        <Typography variant="h6">
                            {issue.checkTypeNm || ''}
                        </Typography>
                        <TextField
                            label="개선사항 입력"
                            multiline
                            rows={4}
                            value={improvementContent}
                            autoComplete="off"
                            onChange={(e) => setImprovementContent(e.target.value)}
                            fullWidth
                            variant="outlined"
                            sx={{mt: 1}}
                        />
                    </Box>
                </Paper>
            </Box>
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
                    id="submitButton"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                        maxWidth: '600px',
                        fontSize: '1.3rem',
                        boxShadow: 'none',
                        backgroundColor: isButtonEnabled ? 'var(--main-blue-color)' : '',
                    }}
                    onClick={handleImprovementSubmit}
                    disabled={!isButtonEnabled}
                >
                    {resolve ? '개선안 수정' : '개선안 등록'}
                </Button>
            </Box>
        </Box>
    );
}
export default validationAuth(ImprovementInfoRegistration);