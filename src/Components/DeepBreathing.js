import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import breathingGif from '../breathing.gif';


const windowWidth = Dimensions.get('window').width;

const DeepBreathing = () => {
    const [start, setStart] = useState(false);
    const [startTimer, setStartTimer] = useState(0);
    const navigation = useNavigation();

    // Function to handle logout
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };


    // Function to handle start of deep breathing
    const handleStart = () => {
        setStart(true);
        setStartTimer(new Date().getTime());
    };

    // Function to handle end of deep breathing
    const handleEnd = async () => {
        setStart(false);
        const endTime = new Date().getTime();
        const duration = (endTime - startTimer) / 1000;

        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const data = {
                [Date.now().toString()]: {
                    duration: duration.toFixed(2),
                    date: new Date().toISOString().split('T')[0],
                    weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
                },
            };

            await setDoc(userDocRef, { DeepBreathing: data }, { merge: true });

        } catch (error) {
            console.error('Error saving deep breathing data:', error);
        }
    };

    // Function to get the Monday of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                {start ? null : (
                    <>
                        <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                            <Image source={require('../logout.png')} style={styles.logoutImg} />
                        </TouchableOpacity>
                        <Image source={require('../logotop.png')} style={styles.img} />
                    </>
                )}

                {start ? (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.introduction}>Deep Breathing Technique</Text>
                            <Text style={styles.text}>Perform deep breathing to relax</Text>
                        </View>

                        <View style={styles.exerciseContainer}>
                            <Image source={breathingGif} resizeMode="contain" style={styles.shape} />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleEnd}>
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (

                    <>

                        <View style={styles.headerContainer}>
                            <Text style={styles.introduction}>Deep Breathing Technique</Text>
                            <Text style={styles.text}>Perform deep breathing to relax</Text>

                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleStart}>
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>

                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: '25%',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#AF3E76',
        borderRadius: 5,
        marginTop: 15,
        width: 200,
        height: 80,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    btnText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
    img: {
        position: 'absolute',
        width: 337.5,
        height: 67.5,
        top: 10,
        left: 1,
    },
    logout: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    logoutImg: {
        width: 50,
        height: 50,
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    scores: {
        marginTop: 15,
        fontSize: 18,
        fontFamily: 'SourceCodePro-Medium',
        color: 'black',
    },
    button: {
        backgroundColor: '#af3e76',
        width: '30%',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'SourceCodePro-Medium',
    },
    exerciseContainer: {
        borderWidth: 2,
        width: '100%',
        aspectRatio: 1,
        marginBottom: 20,
        position: 'relative',
    },
    shape: {
        position: 'absolute',
        width: '100%', // Adjust the width to fill the container
        height: '100%', // Adjust the height to fill the container
    },
});

export default DeepBreathing;

