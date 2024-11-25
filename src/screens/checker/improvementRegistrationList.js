import React, { useState, useEffect } from 'react';
import validationAuth from '../../validationAuth';
import axios from 'axios';
import {
    Container, List, ListItem, ListItemText, ListItemSecondaryAction,
    Box, Button, IconButton, ListItemIcon, Typography, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as common from '../../commons/common';
import { useNavigate } from 'react-router-dom';

const ImprovementRegistrationList = () => {
    const [items, setItems] = useState([]);
    const [facilityTypes, setFacilityTypes] = useState([]);
    const [selectedFacilityType, setSelectedFacilityType] = useState(0);
    const navigate = useNavigate();

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
                }));
                const savedOrder = JSON.parse(localStorage.getItem('improvementRegistrationListOrder'));
                if (savedOrder) {
                    const orderedItems = savedOrder.map(id => fetchedItems.find(item => item.id === id)).filter(Boolean);
                    setItems(orderedItems);
                } else {
                    setItems(fetchedItems);
                }
                localStorage.setItem('improvementRegistrationListItems', JSON.stringify(fetchedItems));
            }
        } catch (error) {
            common.handleApiError(error);
        }
    };

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

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const newList = Array.from(items);
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);
        setItems(newList);
        localStorage.setItem('improvementRegistrationListOrder', JSON.stringify(newList.map(item => item.id)));
        localStorage.setItem('improvementRegistrationListItems', JSON.stringify(newList));
    };

    const handleItemClick = (item) => {
        navigate(`/checker/improvement-registration/${item.id}`, {
            state: {
                facilityId: item.id,
                facilityName: item.title
            }
        });
    };

    const handleFacilityTypeChange = (event) => {
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
                    onChange={handleFacilityTypeChange}
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
                                            <div ref={provided.innerRef} {...provided.draggableProps}>
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
                                                        <Button
                                                            variant="contained"
                                                            sx={{
                                                                backgroundColor: 'var(--main-softblue-color)',
                                                                color: 'white',
                                                                borderRadius: '16px',
                                                                padding: '4px 12px',
                                                                fontSize: '0.7rem',
                                                                boxShadow: 'none',
                                                                minWidth: '80px',
                                                                '&:hover': {
                                                                    backgroundColor: item.complete ? '#ACB7C7' : '#429BE1',
                                                                    boxShadow: 'none',
                                                                },
                                                                '&:active': {
                                                                    boxShadow: 'none',
                                                                },
                                                            }}
                                                            onClick={() => handleItemClick(item)}
                                                        >
                                                            등록하기
                                                        </Button>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index !== items.length - 1 && (
                                                    <Box sx={{ height: '7px', bgcolor: 'var(--main-white-color)' }} />
                                                )}
                                            </div>
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
export default validationAuth(ImprovementRegistrationList);