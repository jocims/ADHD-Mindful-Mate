//ResetPassword.js

import React, { useState } from 'react';
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
import { auth, sendPasswordResetEmail } from '../config/firebase'; // Adjust the import

const ResetPassword = () => {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const resetPassword = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent successfully');
            setLoading(false);
            navigation.navigate('FirstScreen');
        } catch (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                    source={require('../logo3.png')}
                    style={styles.img}
                />
                <Text style={styles.introduction}>Reset Password</Text>

                <View style={styles.form}>

                    <Text style={styles.label}>Email: </Text>

                    <TextInput
                        placeholder="joe.doe@gmail.com"
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                    />

                    <TouchableOpacity style={styles.btn} onPress={resetPassword}>
                        <Text style={styles.btnText}>Reset Password</Text>
                    </TouchableOpacity>

                    <View style={styles.resetArea}>
                        <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.navigate('FirstScreen')}>
                            <Text style={styles.resetText}>Back to Home Screen</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </ScrollView>
        </View>
    );

}

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
        fontSize: 20,
        color: 'black',
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',

    },
    form: {
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: 'black',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1.5,
        width: 300,
        borderColor: 'black',
        padding: 10,
        borderRadius: 7,
        marginBottom: 30,
    },
    btn: {
        width: 150,
        height: 50,
        backgroundColor: '#052458',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: 17,
        color: 'white',
        fontWeight: 'bold',
        opacity: 0.9,
    },
    resetText: {
        fontSize: 14,
        color: 'black',
        marginTop: 100,
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        textAlign: 'center', // Align the text to the right within its container
    },
    resetArea: {
        flexDirection: 'row', // Set the direction of the container to row
        justifyContent: 'space-between',
    },
});

export default ResetPassword;