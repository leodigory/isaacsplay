import React, { useState, useEffect, useRef } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './Sidebar.css';

const Sidebar = ({ isExpanded, toggleSidebar, selectedItem, setSelectedItem }) => {
    const items = [
        { text: 'Home', icon: <HomeIcon />, key: 'home' },
        { text: 'Movies', icon: <MovieIcon />, key: 'movies' },
        { text: 'Series', icon: <TvIcon />, key: 'series' },
        { text: 'My List', icon: <FavoriteIcon />, key: 'list' },
    ];
    const [focusedItem, setFocusedItem] = useState(selectedItem);
    const listRef = useRef(null);

    useEffect(() => {
        setFocusedItem(selectedItem);
    }, [selectedItem]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && isExpanded) {
                setSelectedItem(focusedItem);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedItem, setSelectedItem, isExpanded]);

    return (
        <Drawer
            variant="permanent"
            className={`sidebar ${isExpanded ? 'expanded' : ''}`}
        >
            <div className="sidebar-content">
                <List ref={listRef}>
                    <ListItem onClick={toggleSidebar}>
                        <ListItemIcon>
                            <MenuIcon />
                        </ListItemIcon>
                        {isExpanded && <ListItemText primary="" />}
                    </ListItem>
                    {items.map((item) => (
                        <ListItem
                            key={item.key}
                            onClick={() => setSelectedItem(item.key)}
                            className={`${selectedItem === item.key ? 'selected' : ''} ${focusedItem === item.key ? 'focused' : ''}`}
                            onMouseEnter={() => setFocusedItem(item.key)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {isExpanded && <ListItemText primary={item.text} />}
                        </ListItem>
                    ))}
                </List>
            </div>
        </Drawer>
    );
};

export default Sidebar;