import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

const Journaling = () => {
    const [start, setStart] = useState(false);
    const [journalText, setJournalText] = useState('');
    const [prevText, setPrevText] = useState('');
    const navigation = useNavigation();

    // Function to handle start of journaling
    const handleStart = () => {
        setStart(true);
    };

    // Function to handle end of journaling
    const handleEnd = async () => {
        setStart(false);

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
                        date: new Date().toLocaleDateString('en-GB'),
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
        borderWidth: 1,
        borderColor: '#af3e76',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: 'top', // Align text at the top
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
});

export default Journaling;