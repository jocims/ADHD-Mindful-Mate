import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, ImageBackground, Dimensions } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Get the width of the screen
const screenWidth = Dimensions.get('window').width;

// Dynamically calculate the width of the message container based on the screen width
const messageContainerWidth = screenWidth - 40; // Subtracting padding from both sides

const PatientDashboard = () => {
  const navigation = useNavigation();
  const { userData } = useUserData();
  const [storedUserToken, setStoredUserToken] = useState(null);
  const [feelGoodMessage, setFeelGoodMessage] = useState('');
  const [isImageSelected, setIsImageSelected] = useState([false, false, false, false, false]);
  const [messageLength, setMessageLength] = useState(0);


  useEffect(() => {
    const fetchFeelGoodMessage = async () => {
      try {
        let response;
        let data;
        let newMessageLength;

        const storedMessageLength = await ReactNativeAsyncStorage.getItem('messageLength');
        const parseMessageLength = storedMessageLength ? parseInt(storedMessageLength) : 0;

        setMessageLength(parseMessageLength);

        const storedQuote = await ReactNativeAsyncStorage.getItem('feelGoodQuote');
        const storedDate = await ReactNativeAsyncStorage.getItem('feelGoodQuoteDate');

        // Check if there is a stored quote for today
        if (storedQuote && storedDate === new Date().toISOString().split('T')[0]) {
          setFeelGoodMessage(storedQuote);
        } else {
          do {
            // Fetch the inspirational quote from the API
            response = await fetch(`https://favqs.com/api/qotd`);
            data = await response.json();
            newMessageLength = data.quote.body.length;
          } while (newMessageLength < 50 || newMessageLength > 110);

          // Check if a quote is available for the date
          if (data.quote) {
            console.log('Data:', data);
            const quote = data.quote.body;
            console.log('Quote:', quote);

            setFeelGoodMessage(quote);
            // Store the quote and its date
            await ReactNativeAsyncStorage.setItem('feelGoodQuote', quote);
            await ReactNativeAsyncStorage.setItem('feelGoodQuoteDate', new Date().toISOString().split('T')[0]);
            await ReactNativeAsyncStorage.setItem('messageLength', newMessageLength.toString());
          } else {
            setFeelGoodMessage("No quote available for this day.");
          }
        }
      } catch (error) {
        console.error('Error fetching feel-good message:', error);
        setFeelGoodMessage("Failed to fetch quote.");
      }
    };

    // Fetch the feel-good message when the component mounts
    fetchFeelGoodMessage();

    const fetchSelectedEmoji = async () => {
      try {
        const storedIndex = await ReactNativeAsyncStorage.getItem('selectedEmoji');
        const storedDate = await ReactNativeAsyncStorage.getItem('selectedEmojiDate');

        // Check if there is a stored index for today
        if (storedIndex !== null && storedDate === new Date().toISOString().split('T')[0]) {
          // Parse the stored index to an integer
          const index = parseInt(storedIndex);
          // Initialize a new array with all false values
          const newSelectedState = Array(5).fill(false);
          // Set the selected state for the retrieved index to true
          newSelectedState[index] = true;
          // Update the state
          setIsImageSelected(newSelectedState);
        }
      } catch (error) {
        console.error('Error fetching selected emoji:', error);
      }
    };


    fetchSelectedEmoji();
  }, []);


  useEffect(() => {
    // console.log('User Data Changed:', userData);

    // Check if the storedUserToken is updated before logging
    if (storedUserToken !== null) {
      console.log('Stored User Token in PatientDashboard:', storedUserToken);
    }
  }, [userData, storedUserToken]);

  // Function to handle log out
  const handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    setIsImageSelected([false, false, false, false, false]);

    // Navigate back to the login screen
    navigation.navigate('FirstScreen');
  };

  const handleImageSelection = async (index) => {
    // Check if the image is already selected for today
    if (!isImageSelected[index]) {
      try {
        // Create a reference to the user's document in the 'patient' collection
        const userDocRef = doc(db, 'patient', auth.currentUser.uid);

        // Define the mood data to be saved
        const moodData = {
          [Date.now().toString()]: {
            mood: index,
            date: new Date().toISOString().split('T')[0], // Current date
            time: new Date().toISOString(), // Current time
            weekCommencing: getMonday(new Date()).toISOString().split('T')[0], // Monday date of the current week
          },
        };

        // Add the mood data to the 'MoodTracker' map within the user's document
        await setDoc(userDocRef, { MoodTracker: moodData }, { merge: true });

        // Update the selected state of the image
        setIsImageSelected((prevState) => {
          const newState = prevState.map((selected, i) => (i === index ? !selected : false));
          return newState;
        });

        // Store the selected emoji and its date
        await ReactNativeAsyncStorage.setItem('selectedEmoji', index.toString());
        await ReactNativeAsyncStorage.setItem('selectedEmojiDate', new Date().toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error saving mood data:', error);
      }
    }
  };

  // Function to get the Monday date of the current week
  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };


  return (
    <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleLogout} style={styles.logout}>
          <Image source={require('../logout.png')} style={styles.logoutImg} />
        </TouchableOpacity>
        <Image source={require('../logotop.png')} style={styles.img} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.properContent}>
          <Text style={styles.introduction}>
            Hi {userData ? userData.User.firstName + '!\nHow are you today?' : ''}
          </Text>
          <View style={styles.emojiContainer}>
            <TouchableOpacity onPress={() => handleImageSelection(0)}>
              <Image source={isImageSelected[0] ? require('../red.png') : require('../red-clear.png')} style={styles.emojiButton} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelection(1)}>
              <Image source={isImageSelected[1] ? require('../orange.png') : require('../orange-clear.png')} style={styles.emojiButton} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelection(2)}>
              <Image source={isImageSelected[2] ? require('../yellow.png') : require('../yellow-clear.png')} style={styles.emojiButton} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelection(3)}>
              <Image source={isImageSelected[3] ? require('../green.png') : require('../green-clear.png')} style={styles.emojiButton} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelection(4)}>
              <Image source={isImageSelected[4] ? require('../dark-green.png') : require('../dark-green-clear.png')} style={styles.emojiButton} />
            </TouchableOpacity>
          </View>
          <ImageBackground source={require('../message-350-94.png')} style={styles.fellGoodMessageContainer}>
            <Text style={styles.feelGoodMessage}>{feelGoodMessage}</Text>
          </ImageBackground>
          <View style={styles.functionalities}>
            <TouchableOpacity onPress={() => navigation.navigate('WeeklyTasks')}>
              <Image source={require('../tasks.png')} style={styles.btnImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Game')}>
              <Image source={require('../game.png')} style={styles.btnImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Meditation')}>
              <Image source={require('../meditation.png')} style={styles.btnImage} />
            </TouchableOpacity>
          </View>
          <View style={styles.functionalities}>
            <TouchableOpacity onPress={() => navigation.navigate('DeepBreathing')}>
              <Image source={require('../deep-breathing.png')} style={styles.btnImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Journaling')}>
              <Image source={require('../journal.png')} style={styles.btnImage} />
            </TouchableOpacity>
            <TouchableOpacity >
              <Image source={require('../report.png')} style={styles.btnImage} />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    width: 337.5,
    height: 67.5,
    top: 10,
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
  functionalities: {
    flexDirection: 'row',
    padding: 10,
  },
  btnImage: {
    width: (screenWidth / 3) - 10,
    height: (screenWidth / 3) - 10,
  },
  emojiButton: {
    width: 50,
    height: 50,
  },
  properContent: {
    marginTop: 85,
  },
  introduction: {
    fontSize: 25,
    textAlign: 'center',
    color: '#0C5E51',
    fontFamily: 'SourceCodePro-Bold',
  },
  feelGoodMessage: {
    fontSize: 13,
    textAlign: 'center',
    color: '#E0E0E0',
    fontFamily: 'SourceCodePro-Regular',
    padding: 15,
  },
  fellGoodMessageContainer: {
    width: 350,
    height: 94, // Fixed height
    left: (screenWidth - 350) / 2.5, // Center horizontally
    justifyContent: 'center', // Align items horizontally in the center
    alignItems: 'center', // Align items vertically in the center
    marginBottom: 15,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 15,
  },
});

export default PatientDashboard;