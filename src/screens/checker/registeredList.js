import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import axios from 'axios';
import {
    Container, List, ListItem, ListItemText, ListItemSecondaryAction,
    Box, IconButton, ListItemIcon, Typography, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import * as common from '../../commons/common';
import { useNavigate } from 'react-router-dom';

//점검목록 - 조회 tab (점검 완료한 리스트)
const RegisteredList = () => {
    const [items, setItems] = useState([]);
    const [facilityTypes, setFacilityTypes] = useState([]);
    const [selectedFacilityType, setSelectedFacilityType] = useState(0);
    const navigate = useNavigate();

    // 점검 목록 가져오기
    const fetchItems = async (facilityTypeId) => {
        const url = `${common.getApiUrl()}/checker`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    facilityTypeId: facilityTypeId || ''
                }
            });
            if (response.data && Array.isArray(response.data)) {
                const fetchedItems = response.data.map(item => ({
                    id: item.facilityId.toString(),
                    title: item.facilityNm,
                    description: `${item.facilityTypeNm || 'N/A'}`,
                    lastCheckTime: item.lastCheckTime
                }));
                const savedOrder = JSON.parse(localStorage.getItem('checkListOrder'));
                if (savedOrder) {
                    const orderedItems = savedOrder.map(id => fetchedItems.find(item => item.id === id)).filter(Boolean);
                    setItems(orderedItems);
                } else {
                    setItems(fetchedItems);
                }
                localStorage.setItem('checkListItems', JSON.stringify(fetchedItems));
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

    // 시설 유형 목록 가져오기
    const fetchFacilityTypes = async () => {
        const url = `${common.getApiUrl()}/checker/facilityType`;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data && Array.isArray(response.data)) {
                const updatedFacilityTypes = [
                    {
                        facilityTypeId: 0,
                        facilityTypeNm: "전체"
                    },
                    ...response.data 
                ];
                setFacilityTypes(updatedFacilityTypes);
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchFacilityTypes();
    }, []);

    // 드래그 앤 드롭 종료 처리
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const newList = Array.from(items);
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);
        setItems(newList);
        localStorage.setItem('checkListOrder', JSON.stringify(newList.map(item => item.id)));
        localStorage.setItem('checkListItems', JSON.stringify(newList));
    };

    const handleItemClick = (item) => {
        navigate(`/checker/registered-detail/${item.id}`, { state: { facilityId: item.id, facilityName: item.title } });
    };

    const handleSelectChange = (event) => {
        setSelectedFacilityType(event.target.value);
        fetchItems(event.target.value);
    };

    return (
        <Container
            maxWidth="false"
            sx={{
                width: '100%',
                mx: 'auto',
                pt: 2,
                backgroundColor: 'var(--main-white-color)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <FormControl fullWidth sx={{ mb: 3.5, position: 'relative' }}>
            <Select
                    id="select"
                    value={String(selectedFacilityType) || ''}
                    onChange={handleSelectChange}
                    IconComponent={ExpandMoreIcon}
                    displayEmpty
                    sx={{
                        border: '1px solid #4B9CDC',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            height: '100%',
                        },
                    }}
                >
                    {facilityTypes.map((type) => (
                        <MenuItem key={type.facilityTypeId} value={String(type.facilityTypeId)}>
                            <Typography >{type.facilityTypeNm}</Typography>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-list">
                        {(provided) => (
                            <List ref={provided.innerRef} {...provided.droppableProps}
                                sx={{ width: '100%', bgcolor: 'background.paper', paddingTop: 0, paddingBottom: 0 }}>
                                {items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <Box ref={provided.innerRef} {...provided.draggableProps}>
                                                <ListItem
                                                    sx={{
                                                        bgcolor: 'background.paper',
                                                        boxShadow: 'none',
                                                        transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                                                        height: '70px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        paddingLeft: '5px'
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 'auto',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <IconButton
                                                            {...provided.dragHandleProps}
                                                            sx={{
                                                                cursor: 'grab',
                                                                opacity: 0.5,
                                                                padding: 0,
                                                                marginRight: '8px',
                                                                '& svg': {
                                                                    fontSize: '1rem !important',
                                                                }
                                                            }}
                                                        >
                                                            <MenuIcon />
                                                        </IconButton>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.title}
                                                        secondary={
                                                            <Box sx={{
                                                                display: 'inline-block',
                                                                padding: '1px 3px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {item.description}
                                                            </Box>
                                                        }
                                                        primaryTypographyProps={{
                                                            fontSize: '1.2rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <ArrowForwardIosOutlinedIcon onClick={() => handleItemClick(item)} />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index !== items.length - 1 && (
                                                    <Box sx={{ height: '7px', bgcolor: 'var(--main-white-color)' }} />
                                                )}
                                            </Box>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </List>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
        </Container>
    );
}
export default validationAuth(RegisteredList);