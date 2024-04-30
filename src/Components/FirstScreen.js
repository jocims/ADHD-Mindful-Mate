//Login.js

//Imports from libraries
import React, { Component, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Functional component for Login screen
const Login = () => {

    // Navigation
    const navigation = useNavigation();

    // Return statement
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} >
                <View style={[styles.form, styles.text]}>

                    <Image
                        source={require('../logo3.png')}
                        style={styles.img}
                    />

                    <Text style={styles.introduction}>Hello There!</Text>

                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('LoginPatient')}>
                        <View style={styles.btnArea}>
                            <Text style={styles.btnText}>Patient</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('LoginDoctor')}>
                        <View style={styles.btnArea}>
                            <Text style={styles.btnText}>Doctor</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View >
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightgrey',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
    },
    img: {
        width: 250,
        height: 250,
        marginBottom: 20,
        alignSelf: 'center',
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 30,

    },
    form: {
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    btn: {
        width: 250,
        height: 80,
        backgroundColor: '#5D507B',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 5,
    },
    btnText: {
        fontSize: 30,
        color: 'white',
        opacity: 0.9,
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default Login;