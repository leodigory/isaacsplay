import React from 'react';
import { Grid, Paper } from '@mui/material';

const MovieGrid = ({ movies, focusedIndex, onFocus, onMovieClick }) => {
    return (
        <div className="movie-strip">
            {movies.map((movie, index) => (
                <Paper
                    key={movie.id}
                    className={`movie-strip-item ${index === focusedIndex ? 'focused' : ''}`}
                    onClick={() => {
                        onFocus(index);
                        onMovieClick(movie);
                    }}
                >
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                        alt={movie.title}
                        className="movie-strip-image"
                    />
                </Paper>
            ))}
        </div>
    );
};

export default MovieGrid;