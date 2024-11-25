import React, {createContext, useState, useContext} from 'react';

const MenuContext = createContext();
export const MenuProvider = ({children}) => {
    const [selectedMenu, setSelectedMenu] = useState('시설정보');
    const [facilityDetailId, setFacilityDetailId] = useState(null); // 선택된 시설의 ID를 관리하는 상태

    return (
        <MenuContext.Provider value={{selectedMenu, setSelectedMenu, facilityDetailId, setFacilityDetailId}}>
            {children}
        </MenuContext.Provider>
    );
};
export const useMenu = () => useContext(MenuContext);
