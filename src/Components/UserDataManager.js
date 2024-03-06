// UserDataManager.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../config/firebase'; // Adjust the import
import { doc, getDoc } from 'firebase/firestore';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkUserData = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const userRole = await AsyncStorage.getItem('userRole');
                console.log('userToken in UserDataManager:', userToken);

                if (userToken) {
                    // Adjust the collection based on the user type (patient or doctor)
                    const collectionName = userRole;
                    console.log('collectionName:', collectionName);

                    const docRef = doc(db, collectionName, userToken);
                    const userDoc = await getDoc(docRef);
                    const userData = userDoc.data();
                    setUserData(userData);
                }
            } catch (error) {
                console.error('Error reading user data from AsyncStorage:', error);
            }
        };

        checkUserData();
    }, []);

    const updateUserData = async (newData) => {
        try {
            console.log('Updating user data:', newData);

            if (!newData) {
                console.warn('No user data provided for update.');
                return;
            }

            // Adjust the collection based on the user type (patient or doctor)
            const collectionName = newData.uid.startsWith('patient') ? 'patient' : 'doctor';

            // Fetch user data from Firestore
            const docRef = doc(db, collectionName, newData.uid);
            const userDoc = await getDoc(docRef);
            const updatedUserData = userDoc.data();

            console.log('Fetched user data from Firestore:', updatedUserData);

            // Update the context with the fetched data
            setUserData(updatedUserData);

            console.log('User data updated successfully.');
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    return (
        <UserDataContext.Provider value={{ userData, updateUserData }}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
};