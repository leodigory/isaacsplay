import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Profile.css';

const Profile = React.forwardRef(({ name, color, onClick, onRemove, isFocused, isManaging }, ref) => (
  <div
    className={`profile ${isFocused ? 'focused' : ''}`}
    onClick={onClick}
    ref={ref}
    tabIndex={0}
    style={{ backgroundColor: color }}
  >
    <div className="profile-name">{name}</div>
    {isManaging && (
      <div className="profile-actions">
        <IconButton onClick={onClick} aria-label="editar perfil">
          <EditIcon />
        </IconButton>
        <IconButton onClick={onRemove} aria-label="remover perfil">
          <DeleteIcon />
        </IconButton>
      </div>
    )}
  </div>
));

export default Profile;