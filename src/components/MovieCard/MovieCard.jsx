import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import './MovieCard.css';

const MovieCard = ({ movie, onFocus, isFocused }) => {
  return (
    <Card
      className={`movie-card ${isFocused ? 'focused' : ''}`}
      onMouseEnter={onFocus}
    >
      <Box className="card-media-wrapper">
        <CardMedia
          component="img"
          height="200"
          image={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
          alt={movie.title}
          className="card-media-image"
        />
      </Box>
      <CardContent className="card-content">
        <Typography variant="h6" className="card-title">{movie.title}</Typography>
      </CardContent>
    </Card>
  );
};

export default MovieCard;