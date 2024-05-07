import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, Image, ScrollView, ImageBackground, Dimensions } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import messages from '../messages.json'; // Import the JSON file
import DatePicker from 'react-native-date-picker'; // Import DatePicker

// Get the width of the screen
const screenWidth = Dimensions.get('window').width;

const PatientDashboard = () => {
  const navigation = useNavigation();
  const { userData } = useUserData();
  const [storedUserToken, setStoredUserToken] = useState(null);
  const [feelGoodMessage, setFeelGoodMessage] = useState('');
  const [isImageSelected, setIsImageSelected] = useState([false, false, false, false, false]);
  const [messageLength, setMessageLength] = useState(0);
  const [patientData, setPatientData] = useState(null); // <-- Add this line
  const isDoctor = false;
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

  useEffect(() => {
    // Set the patientData state with the fetched userData
    setPatientData(userData);
  }, [userData]);

  useEffect(() => {
    const fetchFeelGoodMessage = async () => {
      try {
        // Get the stored message length
        const storedMessageLength = await ReactNativeAsyncStorage.getItem('messageLength');
        const parseMessageLength = storedMessageLength ? parseInt(storedMessageLength) : 0;

        // Set the message length state
        setMessageLength(parseMessageLength);

        // Get the stored quote and date
        const storedQuote = await ReactNativeAsyncStorage.getItem('feelGoodQuote');
        const storedDate = await ReactNativeAsyncStorage.getItem('feelGoodQuoteDate');

        // Check if there is a stored quote for today
        if (storedQuote && storedDate === new Date().toISOString().split('T')[0]) {
          setFeelGoodMessage(storedQuote);
        } else {
          // Generate a random index to select a message from the JSON file
          const randomIndex = Math.floor(Math.random() * messages.messages.length);
          const randomMessage = messages.messages[randomIndex].message;

          // Set the feel-good message state and store it
          setFeelGoodMessage(randomMessage);
          await ReactNativeAsyncStorage.setItem('feelGoodQuote', randomMessage);
          await ReactNativeAsyncStorage.setItem('feelGoodQuoteDate', new Date().toISOString().split('T')[0]);
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

  const fetchNewFeelGoodMessage = async () => {
    try {
      // Generate a random index to select a message from the JSON file
      const randomIndex = Math.floor(Math.random() * messages.messages.length);
      const randomMessage = messages.messages[randomIndex].message;

      // Set the feel-good message state and store it
      setFeelGoodMessage(randomMessage);
      await ReactNativeAsyncStorage.setItem('feelGoodQuote', randomMessage);
      await ReactNativeAsyncStorage.setItem('feelGoodQuoteDate', new Date().toISOString().split('T')[0]);
      await ReactNativeAsyncStorage.setItem('messageLength', randomMessage.length.toString());
    } catch (error) {
      console.error('Error fetching feel-good message:', error);
      setFeelGoodMessage("Failed to fetch quote.");
    }
  };

  const handleImageSelection = async (index) => {
    // Check if the image is already selected for today
    if (!isImageSelected[index]) {
      try {
        // Create a reference to the user's document in the 'patient' collection
        const userDocRef = doc(db, 'patient', auth.currentUser.uid);

        const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const [hours, minutes] = currentTime.split(':');
        const timeWithoutSeconds = `${hours}:${minutes}`;

        const emotions = ['Very Sad', 'Sad', 'Indifferent', 'Happy', 'Very Happy'];
        const id = Date.now().toString();

        // Define the mood data to be saved
        const data = {
          [id]: {
            id: id,
            mood: emotions[index],
            date: startDate.toLocaleDateString('en-GB'),
            time: timeWithoutSeconds, // Current time
            weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
          },
        };

        // Add the mood data to the 'MoodTracker' map within the user's document
        await setDoc(userDocRef, { MoodTracker: data }, { merge: true });

        // Update the selected state of the image
        setIsImageSelected((prevState) => {
          const newState = prevState.map((selected, i) => (i === index ? !selected : false));
          return newState;
        });

        // Store the selected emoji and its date
        await ReactNativeAsyncStorage.setItem('selectedEmoji', index.toString());
        await ReactNativeAsyncStorage.setItem('selectedEmojiDate', new Date().toISOString().split('T')[0]);

        updateUserData({ uid: auth.currentUser.uid });

        // Check if one of the first three emojis is selected
        if (index < 3) {
          // Fetch a new feel-good message
          await fetchNewFeelGoodMessage();
        }
      } catch (error) {
        console.error('Error saving mood data:', error);
      }
      setStartDate(new Date());
    }
  };

  // Function to get the Monday date of the current week
  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const weeklyReport = async () => {
    await updateUserData({ uid: auth.currentUser.uid });
    navigation.navigate('WeeklyReport', { patientToken: storedUserToken, patientData: patientData, isDoctor: isDoctor });
  };

  // Function to handle log out
  const handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    setIsImageSelected([false, false, false, false, false]);

    // Navigate back to the login screen
    navigation.navigate('FirstScreen');
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

          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.fieldLabel}>Start Date</Text>
              <Text
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                {startDate instanceof Date ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
              </Text>
            </View>
          </TouchableOpacity>

          {showStartDatePicker && ( // Conditionally render the modal containing the date picker
            <Modal
              animationType="slide"
              transparent={true}
              visible={showStartDatePicker}
              onRequestClose={() => setShowStartDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    mode="date"
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                  />
                  <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                    <Text>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

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
            <TouchableOpacity style={styles.btn} onPress={weeklyReport}>
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
    marginTop: 70,
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
    fontSize: 16,
    color: 'black',
    marginBottom: 1,
    fontFamily: 'SourceCodePro-Medium',
    marginStart: 5,
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: -7,
    marginEnd: 20,
  },
  input: {
    fontSize: 16,
    width: 200,
    height: 40,
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
    textAlign: 'center',
    padding: 10,
  },
});

export default PatientDashboard;