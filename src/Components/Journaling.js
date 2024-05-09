import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';
import DatePicker from 'react-native-date-picker'; // Import DatePicker

const Journaling = () => {
    const [start, setStart] = useState(false);
    const [journalText, setJournalText] = useState('');
    const [prevText, setPrevText] = useState('');
    const navigation = useNavigation();
    const { updateUserData } = useUserData();
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [maximumDate, setMaximumDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);

    useEffect(() => {
        // Function to generate dates for the current week (Monday to Sunday)
        const generateWeekDates = () => {
            const currentDate = new Date();
            const monday = getMonday(currentDate);
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                dates.push(date);
            }
            return dates;
        };

        setMinimumDate(getMonday(new Date()));

        // Set week dates
        const dates = generateWeekDates();
        setWeekDates(dates);

        // Set maximum date to end of last date in the week list
        const lastDate = dates[dates.length - 1];
        const maxDate = new Date(lastDate);
        maxDate.setHours(23, 59, 59); // Set time to end of the day
        setMaximumDate(maxDate);

        console.log('Start Date:', startDate);
    }, []);

    const BackToDashboard = async () => {
        // Update user data context
        updateUserData({ uid: auth.currentUser.uid });
        navigation.navigate('PatientDashboard');
    };

    // Function to handle start of journaling
    const handleStart = () => {
        setStart(true);
    };

    // Function to handle end of journaling
    const handleEnd = async () => {
        console.log('Journal Text:', journalText);

        try {

            // Get current local time without seconds
            const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
            const [hours, minutes] = currentTime.split(':');
            const timeWithoutSeconds = `${hours}:${minutes}`;

            if (journalText !== '') {
                const userDocRef = doc(db, 'patient', auth.currentUser.uid);
                const id = Date.now().toString();
                const data = {
                    [id]: {
                        id: id,
                        journalTextEntryText: journalText,
                        date: startDate.toLocaleDateString('en-GB'),
                        time: timeWithoutSeconds,
                        weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
                    },
                };

                await setDoc(userDocRef, { Journaling: data }, { merge: true });
            }

        } catch (error) {
            console.error('Error saving deep breathing data:', error);
        }

        // Clear the journal text
        setJournalText('');
        setPrevText('');
        setStartDate(new Date());
        setStart(false);
    };

    // Function to handle log out
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
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
                            <Text style={styles.introduction}>Journaling</Text>
                            <Text style={styles.text}>Record your thoughts and reflections.</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                                <TextInput
                                    style={styles.input}
                                    multiline={true}
                                    placeholder="Write your journal entry here..."
                                    value={journalText}
                                    onChangeText={text => {
                                        // Limit the number of characters
                                        if (text.length <= 700) {
                                            // Limit the number of lines
                                            const lines = text.split('\n');
                                            if (lines.length <= 20) {
                                                setJournalText(text);
                                            }
                                        }
                                    }}
                                    onKeyPress={({ nativeEvent }) => {
                                        // Prevent new lines when the maximum number of lines is reached
                                        if (nativeEvent.key === 'Enter' && journalText.split('\n').length >= 30) {
                                            nativeEvent.preventDefault();
                                        }
                                    }}
                                />
                            </ScrollView>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.button} onPress={handleEnd}>
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.headerContainer}>
                            <Text style={styles.introduction}>Journaling</Text>
                            <Text style={styles.text}>Record your thoughts and reflections.</Text>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleStart}>
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={BackToDashboard}>
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
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: '45%',
    },
    inputContainer: {
        flex: 1,
        width: '100%',
    },
    input: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        textAlignVertical: 'top', // Align text at the top
        color: '#333',
        backgroundColor: '#fff',
        shadowColor: '#af3e76',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        fontFamily: 'SourceCodePro-Regular',
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
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: '100%',
    },
    fieldLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'SourceCodePro-Medium',
        marginStart: 5,
        textAlign: 'center',
    },
    input: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        fontFamily: 'SourceCodePro-Regular',
        color: '#333',
        backgroundColor: '#fff',
        shadowColor: '#af3e76',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default Journaling;