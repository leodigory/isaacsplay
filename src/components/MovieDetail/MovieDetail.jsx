import React from 'react';
import { Box, Typography } from '@mui/material';
import './MovieDetail.css';

const MovieDetail = ({ movie }) => {
  if (!movie) return null;

  return (
    <Box className="movie-detail">
      <Box
        component="img"
        src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} // Use backdrop_path para a imagem grande
        alt={movie.title}
        className="movie-detail-image"
      />
      <Box className="movie-detail-content">
        <Typography variant="h3">{movie.title}</Typography>
        <Typography variant="body1">{movie.overview}</Typography>
      </Box>
    </Box>
  );
};

export default MovieDetail;