import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground, Image, FlatList, TextInput, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, auth } from '../config/firebase'; // Adjust the import
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useUserData } from './UserDataManager';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

const PatientsList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const userToken = route.params?.userToken;
    const { userData } = useUserData();
    const [patients, setPatients] = useState([]);
    const [originalPatients, setOriginalPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const isDoctor = true;


    // Define fetchPatients outside of useEffect
    const fetchPatients = async () => {
        try {
            console.log('Current logged in user: ', userToken)
            if (userData && userData.User.isDoctor) {
                const patientsRef = collection(db, 'patient');
                const q = query(patientsRef, where('User.doctorId', '==', userToken));
                const querySnapshot = await getDocs(q);
                const patientsData = [];
                querySnapshot.forEach((doc) => {
                    patientsData.push({ id: doc.id, ...doc.data() });
                });
                patientsData.sort((a, b) => a.User.firstName.localeCompare(b.User.firstName));
                setOriginalPatients(patientsData);
                setPatients(patientsData);

            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [userData]);


    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        console.log('Search query:', query);
        if (query === '') {
            // If the query is empty, reset the patient list to its original state
            setPatients(originalPatients);
        } else {
            // Filter patients based on the full name
            const filteredPatients = originalPatients.filter(patient =>
                (patient.User.firstName + " " + patient.User.lastName).toLowerCase().includes(query.toLowerCase())
            );
            setPatients(filteredPatients);
        }
    };

    const renderPatient = ({ item }) => (
        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('WeeklyReport', { patientToken: item.id, patientData: item, isDoctor: isDoctor })}
        >
            <Text style={styles.buttonText}>{item.User.firstName + " " + item.User.lastName}</Text>
        </TouchableOpacity>
    );

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                    <Image source={require('../logout.png')} style={styles.logoutImg} />
                </TouchableOpacity>
                <Image source={require('../logotop.png')} style={styles.img} />
                <Text style={styles.header}>Patients</Text>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search Patients..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <FlatList
                    data={patients}
                    numColumns={2}
                    renderItem={renderPatient}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.flatListContainer}
                />
                <View style={styles.dashboardBottomButtonContainer}>
                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('DoctorDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch' if you want to stretch the image to fit
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Set background color to transparent so that the image background is visible
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        position: 'absolute',
        width: windowWidth * 0.75,
        height: 50.625, // Adjust the height proportionally to maintain aspect ratio
        top: 15,
        left: 1, // Adjust the right position as needed
    },
    logout: {
        position: 'absolute',
        top: 15,
        right: 15, // Adjust the right position as needed
    },
    logoutImg: {
        width: 50,
        height: 50,
    },
    header: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginTop: 85,
    },
    searchBar: {
        backgroundColor: '#fff',
        width: '90%',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
    },
    flatListContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#AF3E76',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 10,
        width: 150,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
    dashboardBottomButtonContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20, // Add some padding if necessary
    },
    btnDashboard: {
        backgroundColor: '#052458',
        padding: 10,
        borderRadius: 5,
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDashboardText: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default PatientsList;