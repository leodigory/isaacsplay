import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { fetchMovieDetails } from '../../config/tmdb';

import Sidebar from '../../components/Sidebar/Sidebar';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import './Home.css';
import '../../components/MovieGrid/MovieGrid.css';

const Home = ({ isSidebarExpanded, setIsSidebarExpanded, toggleSidebar }) => {
    const location = useLocation();
    const profileId = location.state?.profileId;
    const [movies, setMovies] = useState([]);
    const [selectedItem, setSelectedItem] = useState('home');
    const menuItems = ['home', 'movies', 'series', 'list'];
    const currentUser = auth.currentUser;
    const [progress, setProgress] = useState({});

    // Usando o hook de navegação
    const { focusedIndex, setFocusedIndex, menuFocusedIndex, isMenuFocused } = useKeyboardNavigation(
        movies, // Lista de filmes
        0, // Índice inicial focado
        isSidebarExpanded, // Estado do menu lateral
        setIsSidebarExpanded, // Função para atualizar o menu lateral
        menuItems // Itens do menu lateral
    );

    useEffect(() => {
        const loadMovies = async () => {
            const querySnapshot = await getDocs(collection(db, 'movies'));
            const movieTitles = querySnapshot.docs.map((doc) => doc.data().title);
            const movieDetails = await Promise.all(
                movieTitles.map(async (title) => {
                    const movie = await fetchMovieDetails(title);
                    return movie;
                })
            );
            setMovies(movieDetails.filter((movie) => movie !== null));
        };
        loadMovies();
    }, []);

    useEffect(() => {
        if (currentUser && profileId) {
            const progressDoc = doc(db, 'users', currentUser.uid, 'profiles', profileId);
            getDoc(progressDoc).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    setProgress(docSnapshot.data().progress || {});
                } else {
                    setProgress({});
                }
            });
        }
    }, [currentUser, profileId]);

    useEffect(() => {
        if (isSidebarExpanded && isMenuFocused) {
            setSelectedItem(menuItems[menuFocusedIndex]);
        }
    }, [menuFocusedIndex, isSidebarExpanded, setSelectedItem, menuItems, isMenuFocused]);

    useEffect(() => {
        if (isSidebarExpanded) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isSidebarExpanded]);

    const handleMovieClick = async (movie) => {
        if (currentUser && profileId) {
            const progressDoc = doc(db, 'users', currentUser.uid, 'profiles', profileId);
            const updatedProgress = {
                ...progress,
                [movie.id]: {
                    lastWatchedTime: new Date().toISOString(),
                },
            };
            await setDoc(progressDoc, { progress: updatedProgress }, { merge: true });
            setProgress(updatedProgress);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar
                isExpanded={isSidebarExpanded}
                toggleSidebar={toggleSidebar}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
            />
            <div className="home" style={{ flexGrow: 1, padding: '20px' }}>
                {movies[focusedIndex] && (
                    <div className="selected-movie">
                        <div className="selected-movie-content">
                            <Typography variant="h2">{movies[focusedIndex].title}</Typography>
                            <Typography variant="body1">{movies[focusedIndex].overview}</Typography>
                        </div>
                        <img
                            src={`https://image.tmdb.org/t/p/w1280${movies[focusedIndex].backdrop_path}`}
                            alt={movies[focusedIndex].title}
                            style={{ width: '50%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                    </div>
                )}
                <MovieGrid
                    movies={movies}
                    focusedIndex={focusedIndex}
                    onFocus={setFocusedIndex}
                    onMovieClick={handleMovieClick}
                />
            </div>
        </div>
    );
};

export default Home;