import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin credentials
  const ADMIN_EMAIL = 'admin@isaacplay.com';
  const ADMIN_PASSWORD = '123456';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserProfiles(user.uid);
        checkAdminStatus(user.email);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        setUserProfiles([]);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkAdminStatus = (email) => {
    setIsAdmin(email === ADMIN_EMAIL);
  };

  const loadUserProfiles = async (userId) => {
    try {
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('userId', '==', userId)
      );
      const profilesSnapshot = await getDocs(profilesQuery);
      const profiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserProfiles(profiles);
      
      // Set first profile as current if none selected
      if (profiles.length > 0 && !currentProfile) {
        setCurrentProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      
      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        isAdmin: email === ADMIN_EMAIL
      });

      // Create default profile
      await createProfile(user.uid, displayName, true);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentProfile(null);
      setUserProfiles([]);
    } catch (error) {
      throw error;
    }
  };

  const createProfile = async (userId, name, isDefault = false) => {
    try {
      const profileData = {
        userId,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        isDefault,
        createdAt: new Date(),
        watchHistory: [],
        favorites: [],
        continueWatching: []
      };

      const profileRef = doc(collection(db, 'profiles'));
      await setDoc(profileRef, profileData);
      
      const newProfile = { id: profileRef.id, ...profileData };
      setUserProfiles(prev => [...prev, newProfile]);
      
      return newProfile;
    } catch (error) {
      throw error;
    }
  };

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
  };

  const updateUserProfile = async (profileId, updates) => {
    try {
      await setDoc(doc(db, 'profiles', profileId), updates, { merge: true });
      
      setUserProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId ? { ...profile, ...updates } : profile
        )
      );
      
      if (currentProfile?.id === profileId) {
        setCurrentProfile(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      throw error;
    }
  };

  const addToWatchHistory = async (contentId, contentData) => {
    if (!currentProfile) return;
    
    try {
      const updatedHistory = [
        { ...contentData, watchedAt: new Date(), contentId },
        ...currentProfile.watchHistory.filter(item => item.contentId !== contentId)
      ].slice(0, 50); // Keep only last 50 items

      await updateUserProfile(currentProfile.id, { watchHistory: updatedHistory });
    } catch (error) {
      console.error('Error adding to watch history:', error);
    }
  };

  const addToFavorites = async (contentId, contentData) => {
    if (!currentProfile) return;
    
    try {
      const isAlreadyFavorite = currentProfile.favorites.some(item => item.contentId === contentId);
      let updatedFavorites;
      
      if (isAlreadyFavorite) {
        updatedFavorites = currentProfile.favorites.filter(item => item.contentId !== contentId);
      } else {
        updatedFavorites = [...currentProfile.favorites, { ...contentData, contentId, addedAt: new Date() }];
      }

      await updateUserProfile(currentProfile.id, { favorites: updatedFavorites });
      return !isAlreadyFavorite;
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const updateContinueWatching = async (contentId, contentData, currentTime, duration) => {
    if (!currentProfile) return;
    
    try {
      const progress = (currentTime / duration) * 100;
      
      // Remove if watched more than 90%
      if (progress > 90) {
        const updatedContinueWatching = currentProfile.continueWatching.filter(
          item => item.contentId !== contentId
        );
        await updateUserProfile(currentProfile.id, { continueWatching: updatedContinueWatching });
        return;
      }

      const updatedContinueWatching = [
        { 
          ...contentData, 
          contentId, 
          currentTime, 
          duration, 
          progress,
          updatedAt: new Date() 
        },
        ...currentProfile.continueWatching.filter(item => item.contentId !== contentId)
      ].slice(0, 20); // Keep only last 20 items

      await updateUserProfile(currentProfile.id, { continueWatching: updatedContinueWatching });
    } catch (error) {
      console.error('Error updating continue watching:', error);
    }
  };

  const value = {
    currentUser,
    currentProfile,
    userProfiles,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    createProfile,
    selectProfile,
    updateUserProfile,
    addToWatchHistory,
    addToFavorites,
    updateContinueWatching,
    loadUserProfiles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

